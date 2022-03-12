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
      /*
      const dataRequestListener = actor.listenToDataRequest()
        .then(async ({ id, tknPair }) => {
          await Storage.addMessageToIteration(iterationID, `Got Event Response: ${tknPair} @ ${id}`);
          // call uniswap contract
          const uniswapResponse: UniswapPoolResponse = await pairPricer.selectTokenPair(tknPair);
          await Storage.addMessageToIteration(iterationID, `Received Token Pair: ${tknPair} @ ${uniswapResponse.price}`);

          // check if token pair is valid and if the value is plausible
          if (uniswapResponse.price === 'NaN') {
            throw new Error(`Switch Case Failed for Uniswap with Pair: ${tknPair}`);
          } else {
            const response = await actor.callback(id, uniswapResponse.price);
            if (!response.tx) {
              await Storage.addMessageToIteration(iterationID, `Callback Failed: ${response.descriptor}`);
            } else {
              await Storage.addTransactionToIteration(iterationID, response);
              await Storage.addMessageToIteration(iterationID, 'Finished Callback');
            }
          }
        });
      */

      /*
       * call contract function that triggers the event and trade
       */
      const contractSwapCall = actor.callContractSwap().then(async (tx) => {
        await Storage.addTransactionToIteration(iterationID, tx);
        await Storage.addMessageToIteration(iterationID, 'Finished Contract Swap');
      });

      /**
       * wait until the upper promises are done or timeout
       */
      await Promise.race([
        Promise.all([dataRequestListener]), //contractSwapCall]),
        new Promise((_, reject) => setTimeout(() => reject('Timeout'), 180 * 1000)),
      ]);

      // set length of execution
      const endTime = performance.now();
      await Storage.setPerformanceIteration(iterationID, Number(((endTime - startTime) / 1000).toFixed(1)));

      // reset priority if iteration was successful
      await Storage.resetPriority();

      await Storage.addMessageToIteration(iterationID, 'Finished Iteration');
      await Storage.setSuccessIteration(iterationID, true);

      // set information if the smart contract did sell, buy or hold tokens
      await Storage.setTradedIteration(iterationID, await actor.getStatus());
    } catch (e) {
      console.log(e);
      await handleError(iterationID, e);
    }
    // set status of iteration to inactive
    await Storage.setInProgressIteration(iterationID, false);
    await recordMetaData(iterationID, actor);

    // wait defined amount of seconds before next iteration
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
  } catch (e) {
    await Storage.addMessageToIteration(iterationID, `Can\'t Fetch Amount of Tokens: ${e}`);
  }

  // fetch names
  try {
    const primaryName = await actor.getPrimaryTokenName();
    await Storage.setPrimaryName(primaryName);
  } catch (e) {
    await Storage.addMessageToIteration(iterationID, `Can\'t Fetch Primary Name: ${e}`);
  }

  try {
    const secondaryName = await actor.getSecondaryTokenName();
    await Storage.setSecondaryName(secondaryName);
  } catch (e) {
    await Storage.addMessageToIteration(iterationID, `Can\'t Fetch Secondary Name: ${e}`);
  }

  try {
    const contractName = await actor.getContractName();
    await Storage.setContractName(contractName);
  } catch (e) {
    await Storage.addMessageToIteration(iterationID, `Can\'t Fetch Contract Name: ${e}`);
  }
}
