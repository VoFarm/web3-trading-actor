import { IAccount, INet } from '../../types/web3/web3.ts';
import { EventData, initWeb3, rawTransactionSend, Web3 } from './web3.ts';
import { ITransaction } from '../../types/iteration.ts';
import { Contract } from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-contract/types/index.d.ts';
import { AbiItem } from 'https://deno.land/x/web3@v0.9.2/packages/web3-utils/types/index.d.ts';
import { ERC20TokenAddressPrimary, ERC20TokenAddressSecondary } from './settings.ts';
import { defaultContract } from '../abi/defaultContract.ts';

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
    contractABI: Array<AbiItem>,
  ) {
    this.netSettings = netSettings;
    this.contractOwner = contractOwner;

    this.web3 = initWeb3(this.netSettings.url);
    this.contract = new this.web3.eth.Contract(contractABI, contractAddress, {});
  }

  /**
   * executes 'executeCurrentInvestmentAdvices' on the ethereum net
   *
   * @returns txID: Transaction ID of the contract function
   */
  public async callContractSwap(): Promise<ITransaction> {
    const data = this.contract.methods.executeCurrentInvestmentAdvices().encodeABI();

    // get gasPrice and gasAmount for executing the contract
    const medianGasPricePreviousBlocks: Promise<string> = this.web3.eth.getGasPrice();
    const contractGasEstimation: Promise<string> = this.contract.methods.executeCurrentInvestmentAdvices().estimateGas({
      from: this.contractOwner.publicKey,
    });
    const [gasPrice, gasAmount] = await Promise.all([medianGasPricePreviousBlocks, contractGasEstimation]);

    // create raw transaction to execute contract function
    const rawTx = await rawTransactionSend(
      this.contractOwner,
      gasAmount,
      gasPrice,
      this.contract.options.address,
      data,
      this.netSettings.netID,
    );

    // sign and send transcation
    const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTx, this.contractOwner.privateKey);

    if (!signedTransaction.rawTransaction || (typeof signedTransaction.rawTransaction) !== 'string') {
      throw new Error('Signed Transaction couldn\'t be created');
    }

    let transactionHash: string | undefined = undefined;
    try {
      transactionHash = (await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)).transactionHash;
    } catch {
      // keep undefined
    }

    return {
      tx: transactionHash,
      descriptor: 'Swap Transaction',
      gasLimit: Number(rawTx.gasLimit),
      gasPrice: Number(rawTx.gasPrice),
    };
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
  public async callback(id: string, value: string): Promise<ITransaction> {
    const data = this.contract.methods.callback(id, value).encodeABI();

    // get gasPrice and gasAmount for executing the contract
    const medianGasPricePreviousBlocks: Promise<string> = this.web3.eth.getGasPrice();
    const contractGasEstimation: Promise<string> = this.contract.methods.callback(id, value).estimateGas({
      from: this.contractOwner.publicKey,
    });
    const [gasPrice, gasAmount] = await Promise.all([medianGasPricePreviousBlocks, contractGasEstimation]);

    // create raw transaction to execute contract function
    const rawTx = await rawTransactionSend(
      this.contractOwner,
      gasAmount,
      gasPrice,
      this.contract.options.address,
      data,
      this.netSettings.netID,
    );

    // sign and send transcation
    const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTx, this.contractOwner.privateKey);

    if (!signedTransaction.rawTransaction || (typeof signedTransaction.rawTransaction) !== 'string') {
      throw new Error('Signed Transaction couldn\'t be created');
    }

    let transactionHash: string | undefined = undefined;
    try {
      transactionHash = (await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)).transactionHash;
    } catch {
      // keep undefined
    }

    return {
      tx: transactionHash,
      descriptor: 'Price Callback',
      gasLimit: Number(rawTx.gasLimit),
      gasPrice: Number(rawTx.gasPrice),
    };
  }

  /**
   * starts listening to the specified event and resolves when an event was emitted
   */
  public listenToDataRequest(): Promise<{ id: string; tknPair: string }> {
    return new Promise((resolve, reject) => {
      this.contract.events['requestData']()
        .on('connected', (subscriptionId: string) => {
          this.listeningEvent = subscriptionId;
        })
        .on('data', (event: EventData) => {
          this.listeningEvent = undefined;
          resolve({ id: event.returnValues.id, tknPair: event.returnValues.tknPair });
        })
        .on('error', (error: string, _: string) => {
          this.listeningEvent = undefined;
          reject(error);
        });
    });
  }

  /**
   * fetch the amount of the primary token
   */
  public async getAmountOfPrimaryToken(): Promise<number> {
    const contract = this.generateContractForBalanceRequest(ERC20TokenAddressPrimary);

    return await contract.methods.balanceOf(this.contract.options.address).call();
  }

  /**
   * fetch the amount of the secondary token
   */
  public async getAmountOfSecondaryToken(): Promise<number> {
    const contract = this.generateContractForBalanceRequest(ERC20TokenAddressSecondary);

    return await contract.methods.balanceOf(this.contract.options.address).call();
  }

  /**
   * return official name of the token
   */
  public async getPrimaryTokenName(): Promise<string> {
    const contract = this.generateContractForBalanceRequest(ERC20TokenAddressPrimary);

    return await contract.methods.name().call();
  }

  /**
   * return official name of the token
   */
  public async getSecondaryTokenName(): Promise<string> {
    const contract = this.generateContractForBalanceRequest(ERC20TokenAddressSecondary);

    return await contract.methods.name().call();
  }

  /**
   * return official name of the contract
   */
  public async getContractName(): Promise<string> {
    return await this.contract.methods.name().call();
  }

  /**
   * generate a default contract to access default functions
   *
   * @param contractAddress
   * @private
   */
  private generateContractForBalanceRequest(contractAddress: string): Contract {
    return new this.web3.eth.Contract(defaultContract, contractAddress, {});
  }
}
