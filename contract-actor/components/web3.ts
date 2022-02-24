import Web3 from 'https://deno.land/x/web3@v0.9.2/mod.ts';
import { EventData } from 'https://deno.land/x/web3@v0.9.2/packages/web3-eth-contract/types/index.d.ts';
import { IAccount, IRawTransaction } from '../../types/web3/web3.ts';
import { Storage } from './storage.ts';
import { maxPriority } from './settings.ts';

export { Web3 };
export type { EventData };

/**
 * creates web3.js client with a provider that fits the url
 *
 * @param providerURL
 */
export function initWeb3(providerURL: string): Web3 {
  const options = {
    // Enable auto reconnection
    reconnect: {
      auto: true,
      delay: 10000,
      maxAttempts: 9999,
      onTimeout: true,
    },
  };

  return (new Web3(new Web3.providers.WebsocketProvider(providerURL, options)));
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
  gasEstimation: string,
  gasPrice: string,
  contractAddress: string,
  contractData: string,
  chainId: number,
): Promise<IRawTransaction> {
  if (isNaN(Number(gasEstimation)) || isNaN(Number(gasPrice))) {
    throw new Error('Gas isn\'t a Number');
  }

  return {
    'gasLimit': Web3.utils.toHex(Number(gasEstimation).toFixed(0)),
    'gasPrice': Web3.utils.toHex(
      Number((Number(gasPrice) * Math.min(await Storage.getPriority(), maxPriority)).toFixed(0)),
    ),
    'from': contractOwner.publicKey,
    'to': contractAddress,
    'value': '0x00',
    'data': contractData,
    'chainId': chainId,
  };
}
