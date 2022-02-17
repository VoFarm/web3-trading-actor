import Web3 from 'https://deno.land/x/web3@v0.9.2/mod.ts';
import { EventData } from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-contract/types/index.d.ts';
import { IAccount, IRawTransaction } from '../../types/web3/web3.ts';
import { Storage } from './storage.ts';

export { Web3 };
export type { EventData };

/**
 * creates web3.js client with a provider that fits the url
 *
 * @param providerURL
 */
export function initWeb3(providerURL: string): Web3 {
  return new Web3(providerURL);
}

/**
 * generates an raw transaction object
 *
 * @param contractOwner
 * @param gasEstimation
 * @param gasPrice
 * @param contractAddress
 * @param contractData
 * @param chainId
 */
export async function rawTransactionSend(
  contractOwner: IAccount,
  gasEstimation: number,
  gasPrice: number,
  contractAddress: string,
  contractData: string,
  chainId: number,
): Promise<IRawTransaction> {
  return {
    'gasLimit': Web3.utils.toHex(Number(gasEstimation.toFixed(0))),
    'gasPrice': Web3.utils.toHex(
      Number((gasPrice * await Storage.getPriority()).toFixed(0)),
    ),
    'from': contractOwner.publicKey,
    'to': contractAddress,
    'value': '0x00',
    'data': contractData,
    'chainId': chainId,
  };
}
