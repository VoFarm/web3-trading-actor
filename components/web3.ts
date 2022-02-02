import Web3 from 'https://deno.land/x/web3@v0.8.5/mod.ts'
import {ITradingActor} from "../types/trading-actor.ts";
import {Contract} from 'https://deno.land/x/web3@v0.8.5/packages/web3-eth-contract/types/index.d.ts';

export class TradingActor {
    web3: Web3
    contractOwner: ITradingActor
    contract: Contract
    net: number

    constructor(web3Provider: string, contractOwner: ITradingActor, contractAddress: string, contractABI: any, net: number) {
        this.web3 = new Web3(web3Provider)
        this.contractOwner = contractOwner
        this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
        this.net = net
    }

    getEventOutput(event: string): Promise<{ id: string, tknPair: string }> {
        return new Promise((resolve, reject) => {
            return this.contract.events[event]()
                .on("connected", (subscriptionId: string) => {
                    console.log(`Ready to get Event with ID: ${subscriptionId}`);
                })
                .on('data', function (event: any) {
                    resolve({id: event.returnValues.id, tknPair: event.returnValues.tknPair})
                })
        })
    }

    async callback(id: string, value: string) {
        const data = this.contract.methods.callback(id, value).encodeABI();

        const noncePreviousTAOfSender = await this.web3.eth.getTransactionCount(this.contractOwner.publicKey)
        const medianGasPricePreviousBlocks = Number(await this.web3.eth.getGasPrice())
        const gasEstimation = await this.contract.methods.callback(id, value).estimateGas({from: this.contractOwner.publicKey})

        let rawTx = {
            "nonce": noncePreviousTAOfSender,
            "gasLimit": this.web3.utils.toHex(gasEstimation),
            "gasPrice": this.web3.utils.toHex(medianGasPricePreviousBlocks * 1.05),
            "from": this.contractOwner.publicKey,
            "to": this.contract.options.address,
            "value": "0x00",
            "data": data,
            "chainId": this.net
        }
        const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTx, this.contractOwner.privateKey)

        let transaction = this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string)
            .on('transactionHash', (txHash) => {
                console.log(`Transaction Hash for ID ${id}: ${txHash}`)
            })
            .on('confirmation', (confirmationNumber, _) => {
                confirmationNumber < 7 ? console.log(`Confirmation for ID ${id}: ` + confirmationNumber) : transaction;
            })
            .on('error', (error) => {
                console.log(`Error on ID ${id}:\n${error}`)
            });
    }
}