import { IAccount, INet } from "../../types/web3/web3.ts";
import { EventData, initWeb3, rawTransactionSend, Web3 } from "./web3.ts";
import { Contract } from "https://deno.land/x/web3@v0.9.2/packages/web3-eth-contract/types/index.d.ts";

export class Actor {
  web3: Web3;
  contract: Contract;
  contractOwner: IAccount;
  netSettings: INet;
  listeningEvent: string | undefined;

  constructor(
    netSettings: INet,
    contractOwner: IAccount,
    contractAddress: string,
    contractABI: Array<any>,
  ) {
    this.netSettings = netSettings;
    this.contractOwner = contractOwner;

    this.web3 = initWeb3(this.netSettings.url);
    this.contract = new this.web3.eth.Contract(
      contractABI,
      contractAddress,
      {},
    );
  }

  /**
   * executes 'executeCurrentInvestmentAdvices' on the ethereum net
   *
   * @returns txID: Transaction ID of the contract function
   */
  public async callContractSwap(): Promise<string> {
    const data = this.contract.methods.executeCurrentInvestmentAdvices()
      .encodeABI();

    // get gasPrice and gasAmount for executing the contract
    const medianGasPricePreviousBlocks: Promise<string> = this.web3.eth
      .getGasPrice();
    const contractGasEstimation: Promise<string> = this.contract.methods
      .executeCurrentInvestmentAdvices().estimateGas({
        from: this.contractOwner.publicKey,
      });
    const [gasPrice, gasAmount] = await Promise.all([
      medianGasPricePreviousBlocks,
      contractGasEstimation,
    ]);

    // create raw transaction to execute contract function
    const rawTx = rawTransactionSend(
      this.contractOwner,
      Number(gasAmount),
      Number(gasPrice),
      this.contract.options.address,
      data,
      this.netSettings.netID,
    );

    // sign and send transcation
    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      rawTx,
      this.contractOwner.privateKey,
    );
    return (await this.web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction as string,
    )).transactionHash;
  }

  /**
   * get status of current investment advice
   */
  public getStatus() {
    return this.contract.methods._getLastAdvice().call();
  }

  /**
   * executes 'callback' on the ethereum net
   *
   * @param id
   * @param value
   *
   * @returns txID: Transaction ID of the contract function
   */
  public async callback(id: string, value: string): Promise<string> {
    const data = this.contract.methods.callback(id, value).encodeABI();

    // get gasPrice and gasAmount for executing the contract
    const medianGasPricePreviousBlocks: Promise<string> = this.web3.eth
      .getGasPrice();
    const contractGasEstimation: Promise<string> = this.contract.methods
      .callback(id, value).estimateGas({ from: this.contractOwner.publicKey });
    const [gasPrice, gasAmount] = await Promise.all([
      medianGasPricePreviousBlocks,
      contractGasEstimation,
    ]);

    // create raw transaction to execute contract function
    const rawTx = rawTransactionSend(
      this.contractOwner,
      Number(gasAmount),
      Number(gasPrice),
      this.contract.options.address,
      data,
      this.netSettings.netID,
    );

    // sign and send transcation
    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      rawTx,
      this.contractOwner.privateKey,
    );
    return (await this.web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction as string,
    )).transactionHash;
  }

  /**
   * starts listening to the specified event and resolves when an event was emitted
   */
  public listenToDataRequest(): Promise<{ id: string; tknPair: string }> {
    return new Promise((resolve, reject) => {
      this.contract.events["requestData"]()
        .on("connected", (subscriptionId: string) => {
          this.listeningEvent = subscriptionId;
        })
        .on("data", (event: EventData) => {
          this.listeningEvent = undefined;
          resolve({
            id: event.returnValues.id,
            tknPair: event.returnValues.tknPair,
          });
        })
        .on("error", (error: string, _: any) => {
          this.listeningEvent = undefined;
          reject(error);
        });
    });
  }
}
