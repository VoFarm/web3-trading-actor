import { Actor } from './components/actor.ts';
import { PairPricer } from './components/pairPrices.ts';
import { Storage } from './components/storage.ts';
import { Iteration } from '../types/iteration.ts';
import { UniswapPoolResponse } from '../types/contracts/uniswap.ts';
import { loopSleepSeconds } from './components/settings.ts';
import { handleError } from './error.ts';

/**
 * starts a bot that executes a group of functions that
 * is required by the volatility farm contract
 *
 * @param actor
 * @param pairPricer
 */
export async function startBot(actor: Actor, pairPricer: PairPricer) {
  while (1) {
    // initialize new iteration
    const iterationID = await Storage.newIteration(Iteration());

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
          await Storage.addMessageToIteration(iterationID, `Got Event Response: ${ tknPair } @ ${ id }`);

          // call uniswap contract
          const uniswapResponse: UniswapPoolResponse = await pairPricer.selectTokenPair(tknPair);
          await Storage.addMessageToIteration(iterationID, `Received Token Pair: ${ tknPair } @ ${ uniswapResponse.price }`);

          // check if token pair is valid and if the value is plausible
          if (uniswapResponse.price === 'NaN') {
            throw new Error(`Switch Case Failed for Uniswap with Pair: ${ tknPair }`);
          } else {
            await Storage.addTransactionToIteration(iterationID, await actor.callback(id, uniswapResponse.price));
            await Storage.addMessageToIteration(iterationID, 'Finished Callback');
          }
        });

      /*
       * call contract function that triggers the event and trade
       */
      const contractSwapCall = actor.callContractSwap().then(async (tx) => {
        if (!tx.tx) {
          await Storage.addMessageToIteration(iterationID, 'Contract Swap Failed');
          return;
        }
        await Storage.addTransactionToIteration(iterationID, tx);
        await Storage.addMessageToIteration(iterationID, 'Finished Contract Swap');
      });

      /**
       * wait until the upper promises are done
       */
      await Promise.all([dataRequestListener, contractSwapCall]);

      const endTime = performance.now();
      await Storage.setPerformanceIteration(iterationID, Number(((endTime - startTime) / 1000).toFixed(1)));

      await Storage.resetPriority();
      await Storage.addMessageToIteration(iterationID, 'Finished Iteration');
      await Storage.setSuccessIteration(iterationID, true);
      await Storage.setTradedIteration(iterationID, await actor.getStatus());
    } catch (e) {
      await handleError(iterationID, e);
    }
    await Storage.setInProgressIteration(iterationID, false);
    await recordMetaData(iterationID, actor);

    await new Promise((resolve) => setTimeout(resolve, loopSleepSeconds * 1000));
  }
}

/**
 * records meta data for delivering api
 *
 * @param iterationID
 * @param actor
 */
async function recordMetaData(iterationID: number, actor: Actor) {
  try {
    // get current balance of swapable tokens from the contract
    const [primary, secondary] = await Promise.all([actor.getAmountOfPrimaryToken(), actor.getAmountOfSecondaryToken()]);
    await Storage.newPrice({ primary, secondary, date: new Date() });
  } catch {
    await Storage.addMessageToIteration(iterationID, 'Can\'t Fetch Amount of Tokens');
  }

  try {
    // refresh names of the swapable tokens
    const [primaryName, secondaryName, contractName] = await Promise.all([
      actor.getPrimaryTokenName(),
      actor.getSecondaryTokenName(),
      actor.getContractName(),
    ]);
    await Storage.setPrimaryName(primaryName);
    await Storage.setSecondaryName(secondaryName);
    await Storage.setContractName(contractName);
  } catch {
    await Storage.addMessageToIteration(iterationID, 'Can\'t Fetch Contract and Token Names');
  }
}
