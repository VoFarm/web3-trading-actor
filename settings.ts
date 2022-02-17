import { IAccount, INet } from './types/web3/web3.ts';

export const user: IAccount = {
  publicKey: Deno.env.get('publicAddress') ?? '',
  privateKey: Deno.env.get('privateKey') ?? '',
};
export const actorNet: INet = {
  url: Deno.env.get('actorUrl') ?? '',
  netID: Number(Deno.env.get('actorNetID')) ?? 1,
};
export const pairPricerNet: INet = {
  url: Deno.env.get('pairPricerUrl') ?? '',
  netID: Number(Deno.env.get('pairPricerNetID')) ?? 1,
};

export const loopSleepSeconds: number = Number(Deno.env.get('loopSleepSeconds')) ?? 120;

export const defaultPriority: number = Number(Deno.env.get('defaultPriority')) ?? 1;
