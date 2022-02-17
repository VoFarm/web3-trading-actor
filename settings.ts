import { IAccount, INet } from './types/web3/web3.ts';

export const user: IAccount = {
  publicKey: '',
  privateKey: '',
};
export const actorNet: INet = {
  url: 'wss://rinkeby.infura.io/ws/v3/',
  netID: 4,
};
export const pairPricerNet: INet = {
  url: 'wss://mainnet.infura.io/ws/v3/',
  netID: 1,
};

export const loopSleepSeconds: number = 120;

export const defaultPriority: number = 1.10;
