import {TradingActor} from "./components/actor.ts";
import {TradingContractABI, TradingContractAddress} from "./abi/trading.ts";
import {UniswapPoolResponse} from "./types/uniswap.ts";
import {PairPricer} from "./components/pairPrices.ts";
import {UniswapContractABI} from "./abi/uniswap.ts";
import {Storage} from "./components/storage.ts";
import {actorNet, loopSleepSeconds, pairPricerNet, user} from "./settings.ts";
import {opine} from "https://deno.land/x/opine@2.1.1/mod.ts";
import {opineCors} from "https://deno.land/x/cors/mod.ts";

localStorage.clear()
let performanceTime: number[] = []

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
        try {
            var startTime = performance.now()
            // wait for event
            const eventPromise = actor.getEventOutput("requestData")

            let actorResponse = await actor.callContractSwap()

            if (actorResponse) storage.addConsoleLog("Finished Contract Swap")
            else storage.addConsoleLog("ERROR: callContractSwap Failed")

            const response = await eventPromise

            if (!response) {
                storage.addConsoleLog("ERROR: Event Output Failed")
                continue
            } else storage.addConsoleLog(`Got Event Response: ${response.tknPair}`)

            // call uniswap contract
            let uniswapResponse: UniswapPoolResponse = await pairPricer.selectTokenPair(response.tknPair)
            storage.addConsoleLog(`Received Token Pair: ${uniswapResponse.price}`)
            if (uniswapResponse.price === "NaN") {
                storage.addConsoleLog(`ERROR: Switch Case Failed for Uniswap with Pair: ${response.tknPair}`)
                continue
            } else {
                let callbackResponse = await actor.callback(response.id, uniswapResponse.price)
                if (callbackResponse) storage.addConsoleLog(`Finished Callback`)
                else {
                    storage.addConsoleLog(`ERROR: Callback Failed`)
                    continue
                }
            }

            var endTime = performance.now()

            if (performanceTime.length >= 25)
                performanceTime.shift()
            performanceTime.push(endTime - startTime)
            let date = new Date()
            storage.addConsoleLog(`Finished Iteration | Time: ${date.toDateString()} ${date.toTimeString()} | Pair: ${response.tknPair} | Performance: ${((endTime - startTime) / 1000).toFixed(1)} s`)
            await new Promise(resolve => setTimeout(resolve, loopSleepSeconds * 1000));
        } catch (e) {
            storage.addConsoleLog(e)
            await new Promise(resolve => setTimeout(resolve, loopSleepSeconds * 1000));
        }
    }
}

startServer()

startBot()

