import { IAccount, INet } from '../../types/web3/web3.ts';
import 'https://deno.land/x/dotenv/load.ts';

export const user: IAccount = {
  publicKey: Deno.env.get('publicAddress') ?? '',
  privateKey: Deno.env.get('privateKey') ?? '',
};
export const actorNet: INet = {
  url: Deno.env.get('tradingActorUrl') ?? '',
  netID: Number(Deno.env.get('tradingActorNetID') ?? 1),
};
export const pairPricerNet: INet = {
  url: Deno.env.get('pairPricerUrl') ?? '',
  netID: Number(Deno.env.get('pairPricerNetID') ?? 1),
};

export const loopSleepSeconds = Number(Deno.env.get('sleepSeconds') ?? 120);

export const defaultPriority = Number(Deno.env.get('defaultPriority') ?? 1);

export const tradingActorContractAddress: string = Deno.env.get('tradingActorContractAddress') ?? '';

export const ERC20TokenAddressPrimary = Deno.env.get('ERC20TokenAddressPrimary') ?? '';

export const ERC20TokenAddressSecondary = Deno.env.get('ERC20TokenAddressSecondary') ?? '';

export const httpPort = Number(Deno.env.get('HTTPPort') ?? 3000);
