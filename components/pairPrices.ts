import Web3 from "https://deno.land/x/web3@v0.8.5/mod.ts";
import {Contract} from "https://deno.land/x/web3@v0.8.5/packages/web3-eth-contract/types/index.d.ts";
import {UniswapDAI_ETH, UniswapUSDC_ETH, UniswapWBTC_ETH} from "../abi/uniswap.ts";
import {UniswapPoolResponse} from "../types/uniswap.ts";
import {Storage} from "./storage.ts";

export class PairPricer {
    web3: Web3

    contractUSDC_ETH: Contract
    contractWBTC_ETH: Contract
    contractDAI_ETH: Contract

    constructor(web3Provider: string, contractABI: Array<any>) {
        // this.web3 = web3
        this.web3 = new Web3(web3Provider)
        this.contractUSDC_ETH = new this.web3.eth.Contract(contractABI, UniswapUSDC_ETH);
        this.contractWBTC_ETH = new this.web3.eth.Contract(contractABI, UniswapWBTC_ETH);
        this.contractDAI_ETH = new this.web3.eth.Contract(contractABI, UniswapDAI_ETH);
    }

    async callContractSwap(contract: Contract): Promise<UniswapPoolResponse> {
        const sqrtPriceX96 = await contract.methods.slot0().call()

        // @ts-ignore
        let price = new this.web3.utils.BN(`${sqrtPriceX96[0]}`)
            // @ts-ignore
            .pow(this.web3.utils.toBN(2))
            // @ts-ignore
            .mul(this.web3.utils.toBN(10 ** 18))
            // @ts-ignore
            .div(this.web3.utils.toBN(2).pow(this.web3.utils.toBN(192)))
        return {price: price.toString()}
    }

    async getUSDC_ETH(): Promise<UniswapPoolResponse> {
        return this.callContractSwap(this.contractUSDC_ETH)
    }

    async getWBTC_ETH(): Promise<UniswapPoolResponse> {
        return this.callContractSwap(this.contractWBTC_ETH)
    }

    async getDAI_ETH(): Promise<UniswapPoolResponse> {
        return this.callContractSwap(this.contractDAI_ETH)
    }

    async selectTokenPair(pair: string): Promise<UniswapPoolResponse> {
        switch (pair) {
            case "USDC/WETH":
                return this.getUSDC_ETH();
            case "WBTC/WETH":
                return this.getWBTC_ETH();
            case "DAI/WETH":
                return this.getDAI_ETH();
            default:
                return {price: "NaN"}
        }
    }
}