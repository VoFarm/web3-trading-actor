import Web3 from 'https://deno.land/x/web3@v0.9.2/mod.ts'
import {ITradingActor} from "../types/trading-actor.ts";
import {Contract} from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-contract/types/index.d.ts';
import {Storage} from "./storage.ts";

export class TradingActor {
    web3: Web3
    contractOwner: ITradingActor
    contract: Contract
    net: number
    storage: Storage
    listeningEvent: string | undefined

    constructor(web3Provider: string, contractOwner: ITradingActor, contractAddress: string, contractABI: any, net: number, storage: Storage) {
        this.web3 = new Web3(web3Provider)
        this.contractOwner = contractOwner
        this.contract = new this.web3.eth.Contract(contractABI, contractAddress)
        this.net = net
        this.storage = storage
        this.listeningEvent = undefined
    }

    public async callContractSwap(): Promise<any> {
        const data = this.contract.methods.executeCurrentInvestmentAdvices().encodeABI();

        const noncePreviousTAOfSender = await this.web3.eth.getTransactionCount(this.contractOwner.publicKey)
        const medianGasPricePreviousBlocks = Number(await this.web3.eth.getGasPrice())
        const gasEstimation = await this.contract.methods.executeCurrentInvestmentAdvices().estimateGas({from: this.contractOwner.publicKey})

        let rawTx = {
            "gasLimit": this.web3.utils.toHex(gasEstimation),
            "gasPrice": this.web3.utils.toHex(parseInt(String(medianGasPricePreviousBlocks * this.storage.getPriority()))),
            "from": this.contractOwner.publicKey,
            "to": this.contract.options.address,
            "value": "0x00",
            "data": data,
            "chainId": this.net
        }
        const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTx, this.contractOwner.privateKey)

        return await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string)
    }

    public getStatus() {
        return this.contract.methods._getLastAdvice().call()
    }

    public getEventOutput(event: string): Promise<{ id: string, tknPair: string } | undefined> {
        return new Promise((resolve, reject) => {
            this.contract.events[event]()
                .on("connected", (subscriptionId: string) => {
                    this.listeningEvent = subscriptionId
                })
                .on('data', (event: any) => {
                    this.listeningEvent = undefined
                    resolve({id: event.returnValues.id, tknPair: event.returnValues.tknPair})
                })
                .on('error', (error: any, receipt: any) => {
                    this.listeningEvent = undefined
                    resolve(undefined)
                });
        })
    }

    async callback(id: string, value: string): Promise<any> {

        const data = this.contract.methods.callback(id, value).encodeABI();

        const medianGasPricePreviousBlocks = Number(await this.web3.eth.getGasPrice())
        const gasEstimation = await this.contract.methods.callback(id, value).estimateGas({from: this.contractOwner.publicKey})

        let rawTx = {
            "gasLimit": this.web3.utils.toHex(gasEstimation),
            "gasPrice": this.web3.utils.toHex(parseInt(String(medianGasPricePreviousBlocks * this.storage.getPriority()))),
            "from": this.contractOwner.publicKey,
            "to": this.contract.options.address,
            "value": "0x00",
            "data": data,
            "chainId": this.net
        }
        const signedTransaction = await this.web3.eth.accounts.signTransaction(rawTx, this.contractOwner.privateKey)

        return await this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string)
    }
}