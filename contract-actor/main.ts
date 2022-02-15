import { Actor } from './components/actor.ts';
import { TradingContractABI, TradingContractAddress } from './abi/trading.ts';
import { UniswapPoolResponse } from '../types/contracts/uniswap.ts';
import { PairPricer } from './components/pairPrices.ts';
import { UniswapContractABI } from './abi/uniswap.ts';
import { actorNet, loopSleepSeconds, pairPricerNet, user } from '../settings.ts';
import { NOTMINED, UNDERPRICED } from '../types/errors.ts';
import { Iteration } from '../types/iteration.ts';
import { Storage } from './components/storage.ts';

/**
 * initialize and start bot
 */
export function main() {
  Storage.initializeStorage();

  const actor = new Actor(
    actorNet,
    user,
    TradingContractAddress,
    TradingContractABI,
  );
  const pairPricer = new PairPricer(pairPricerNet, UniswapContractABI);

  startBot(actor, pairPricer);
}

/**
 * starts a bot that executes a group of functions that
 * is required by the volatility farm contract
 *
 * @param actor
 * @param pairPricer
 */
async function startBot(actor: Actor, pairPricer: PairPricer) {
  while (1) {
    // initialize new iteration
    const iterationID = Storage.newIteration(Iteration());

    /*
     * start measuring time between listening to the event 'requestData'
     * and executing the 'callback' function on the blockchain
     */
    const startTime = performance.now();

    try {
      /*
       * start listening to the event
       *
       * when event data was emitted, then it will be processed to execute the 'callback' function
       */
      const dataRequestListener = actor.listenToDataRequest()
        .then(async ({ id, tknPair }) => {
          Storage.addMessageToIteration(iterationID, `Got Event Response: ${tknPair} @ ${id}`);

          // call uniswap contract
          const uniswapResponse: UniswapPoolResponse = await pairPricer.selectTokenPair(tknPair);
          Storage.addMessageToIteration(iterationID, `Received Token Pair: ${tknPair} @ ${uniswapResponse.price}`);

          // check if token pair is valid and if the value is plausible
          if (uniswapResponse.price === 'NaN') {
            Storage.addMessageToIteration(iterationID, `ERROR: Switch Case Failed for Uniswap with Pair: ${tknPair}`);
          } else {
            Storage.addTransactionToIteration(iterationID, await actor.callback(id, uniswapResponse.price));
            Storage.addMessageToIteration(iterationID, 'Finished Callback');
          }
        });
      Storage.addMessageToIteration(iterationID, 'Start listening to \'requestData\' Event');

      /*
       * call contract function that triggers the event and trade
       */
      const contractSwapCall = actor.callContractSwap().then((tx) => {
        Storage.addTransactionToIteration(iterationID, tx);
        Storage.addMessageToIteration(iterationID, 'Finished Contract Swap');
      });

      /**
       * wait until the upper promises are done
       */
      await Promise.all([dataRequestListener, contractSwapCall]);

      const endTime = performance.now();
      Storage.setPerformanceIteration(iterationID, Number(((endTime - startTime) / 1000).toFixed(1)));

      Storage.resetPriority();
      Storage.addMessageToIteration(iterationID, 'Finished Iteration');
      Storage.setSuccessIteration(iterationID, true);
      Storage.setTradedIteration(iterationID, await actor.getStatus());
    } catch (e) {
      handleError(iterationID, e);
    }
    Storage.setInProgressIteration(iterationID, false);
    await new Promise((resolve) => setTimeout(resolve, loopSleepSeconds * 1000));
  }
}

/**
 * defines how to handle an error in an iteration
 *
 * @param iterationID
 * @param message
 */
function handleError(iterationID: number, message: string) {
  Storage.addMessageToIteration(iterationID, message);
  if (message === NOTMINED || message === UNDERPRICED) {
    Storage.increasePriority(5);
  }
}