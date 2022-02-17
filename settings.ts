import { IAccount, INet } from './types/web3/web3.ts';
import "https://deno.land/x/dotenv/load.ts";

export const user: IAccount = {
  publicKey: Deno.env.get('publicAddress') ?? '',
  privateKey: Deno.env.get('privateKey') ?? '',
};
export const actorNet: INet = {
  url: Deno.env.get('actorUrl') ?? '',
  netID: Number(Deno.env.get('actorNetID') ?? 1),
};
export const pairPricerNet: INet = {
  url: Deno.env.get('pairPricerUrl') ?? '',
  netID: Number(Deno.env.get('pairPricerNetID') ?? 1),
};

export const loopSleepSeconds: number = Number(Deno.env.get('sleepSeconds') ?? 120);

export const defaultPriority: number = Number(Deno.env.get('defaultPriority') ?? 1);
