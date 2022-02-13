import { TradingActor } from "./components/actor.ts";
import { TradingContractABI, TradingContractAddress } from "./abi/trading.ts";
import { UniswapPoolResponse } from "./types/uniswap.ts";
import { PairPricer } from "./components/pairPrices.ts";
import { UniswapContractABI } from "./abi/uniswap.ts";
import { Storage } from "./components/storage.ts";
import { actorNet, loopSleepSeconds, pairPricerNet, user } from "./settings.ts";
import { opine } from "https://deno.land/x/opine@2.1.1/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";
import { NOTMINED, UNDERPRICED } from "./types/errors.ts";
import { Iteration } from "./types/iteration.ts";

localStorage.clear()

let storage = new Storage()
let actor = new TradingActor(actorNet.url, user, TradingContractAddress, TradingContractABI, actorNet.netID, storage)
let pairPricer = new PairPricer(pairPricerNet.url, UniswapContractABI)

function startServer() {
  const app = opine();
  app.use(opineCors())

  app.get("/listening", (req, res) => {
    res.send(String(actor.listeningEvent));
  });

  app.get("/log", (req, res) => {
    res.json(storage.getConsoleLog());
  });

  app.get("/iteration", (req, res) => {
    res.json(storage.getIteration(req.query.id));
  });

  app.get("/priority", (req, res) => {
    res.json(storage.getPriority());
  });

  app.get("/count", (req, res) => {
    res.send(String(storage.getCounter() - 1));
  });

  app.get("/", (req, res) => {
    res.sendFile(Deno.cwd() + "/main.html");
  });

  app.listen(3001, () => console.log("Starting at: http://localhost:3001"));
}

async function startBot() {
  while (1) {
    const iteration: Iteration = {
      messages: [],
      traded: "",
      txPrice: "",
      txTrade: "",
      startDate: new Date(),
      seconds: 0,
      success: false
    }

    try {
      const startTime = performance.now()
      // wait for event
      const requestDataPromise = actor.getEventOutput("requestData")

      let temp = (await actor.callContractSwap())
      iteration.txTrade = temp.transactionHash
      iteration.messages.push("Finished Contract Swap")

      const response = await requestDataPromise

      if (!response) {
        iteration.messages.push("ERROR: Event Output Failed")
        continue
      } else iteration.messages.push(`Got Event Response: ${ response.tknPair }`)

      // call uniswap contract
      let uniswapResponse: UniswapPoolResponse = await pairPricer.selectTokenPair(response.tknPair)
      iteration.messages.push(`Received Token Pair: ${ response.tknPair } @ ${ uniswapResponse.price }`)
      if (uniswapResponse.price === "NaN") {
        iteration.messages.push(`ERROR: Switch Case Failed for Uniswap with Pair: ${ response.tknPair }`)
        continue
      } else {
        iteration.txPrice = (await actor.callback(response.id, uniswapResponse.price)).transactionHash
        iteration.messages.push(`Finished Callback`)
      }

      const endTime = performance.now();
      storage.resetPriority()
      iteration.messages.push(`Finished Iteration | Pair: ${ response.tknPair }`)
      iteration.success = true
      iteration.traded = await actor.getStatus()
      iteration.seconds = Number(((endTime - startTime) / 1000).toFixed(1))
    } catch (e) {
      iteration.messages.push(e.message)
      if (e.message === NOTMINED || e.message === UNDERPRICED) {
        storage.increasePriority()
      }
    }
    storage.addNewIteration(iteration)
    await new Promise(resolve => setTimeout(resolve, loopSleepSeconds * 1000));
  }
}

startServer()

startBot()

