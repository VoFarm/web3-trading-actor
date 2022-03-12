export interface INet {
  url: string;
  netID: number;
}

export interface IAccount {
  publicKey: string;
  privateKey: string;
}

export interface IRawTransaction {
  gasLimit: string;
  gasPrice: string;
  from: string;
  to: string;
  value: string;
  data: string;
  chainId: number;
  nonce: number;
}
