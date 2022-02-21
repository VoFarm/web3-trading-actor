import { Actor } from './components/actor.ts';
import { TradingContractABI } from './abi/trading.ts';
import { PairPricer } from './components/pairPrices.ts';
import { UniswapContractABI } from './abi/uniswap.ts';
import { actorNet, pairPricerNet, tradingActorContractAddress, user } from './components/settings.ts';
import { Storage } from './components/storage.ts';
import { startBot } from './bot.ts';

/**
 * initialize and start bot
 */
export async function main(): Promise<boolean> {
  try {
    // initialize essential components
    await Storage.initializeStorage();
    const actor = new Actor(actorNet, user, tradingActorContractAddress, TradingContractABI);
    const pairPricer = new PairPricer(pairPricerNet, UniswapContractABI);

    // run iterations
    await startBot(actor, pairPricer);
    return true;
  } catch {
    return false;
  }
}
