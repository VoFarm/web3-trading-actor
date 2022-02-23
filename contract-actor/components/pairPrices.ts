import { Contract } from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-contract/types/index.d.ts';
import { UniswapDAI_ETH, UniswapUSDC_ETH, UniswapUSDC_WETH, UniswapWBTC_ETH } from '../abi/uniswap.ts';
import { UniswapPoolResponse } from '../../types/contracts/uniswap.ts';
import { initWeb3, Web3 } from './web3.ts';
import { INet } from '../../types/web3/web3.ts';
import { AbiItem } from 'https://deno.land/x/web3@v0.9.2/packages/web3-utils/types/index.d.ts';

export class PairPricer {
  web3: Web3;

  contractUSDC_ETH: Contract;
  contractWBTC_ETH: Contract;
  contractDAI_ETH: Contract;
  contractDAI_WETH: Contract;

  constructor(netSettings: INet, contractABI: Array<AbiItem>) {
    this.web3 = initWeb3(netSettings.url);

    this.contractUSDC_ETH = new this.web3.eth.Contract(contractABI, UniswapUSDC_ETH);
    this.contractWBTC_ETH = new this.web3.eth.Contract(contractABI, UniswapWBTC_ETH);
    this.contractDAI_ETH = new this.web3.eth.Contract(contractABI, UniswapDAI_ETH);
    this.contractDAI_WETH = new this.web3.eth.Contract(contractABI, UniswapUSDC_WETH);
  }

  /**
   * call uniswap function and transform price to usable wei value
   *
   * @param contract
   * @private
   */
  private async callContractSwap(contract: Contract): Promise<UniswapPoolResponse> {
    try {
      const sqrtPriceX96 = await contract.methods.slot0().call();

      const price = this.web3.utils.toBN(`${sqrtPriceX96[0]}`)
        .pow(this.web3.utils.toBN(2))
        .mul(this.web3.utils.toBN(10 ** 18))
        .div(this.web3.utils.toBN(2).pow(Web3.utils.toBN(192)));
      return { price: price.toString() };
    } catch {
      return { price: 'NaN' };
    }
  }

  /**
   * select right contract for price
   *
   * return "NaN" if switch case fails
   *
   * @param pair
   */
  public async selectTokenPair(pair: string): Promise<UniswapPoolResponse> {
    try {
      switch (pair) {
        case 'USDC/ETH':
          return await this.callContractSwap(this.contractUSDC_ETH);
        case 'WBTC/WETH':
          return await this.callContractSwap(this.contractWBTC_ETH);
        case 'DAI/WETH':
          return await this.callContractSwap(this.contractDAI_ETH);
        case 'USDC/WETH':
          return await this.callContractSwap(this.contractDAI_ETH);
        default:
          return { price: 'NaN' };
      }
    } catch {
      return { price: 'NaN' };
    }
  }
}
