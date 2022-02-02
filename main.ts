import {TradingActor} from "./components/web3.ts";
import {ITradingActor} from "./types/trading-actor.ts";
import {TradingContractABI, TradingContractAddress} from "./abi/trading.ts";
import {Immutables, UniswapPoolResponse} from "./types/uniswap.ts";
import {PairPricer} from "./components/pairPrices.ts";
import {UniswapContractABI} from "./abi/uniswap.ts";

async function startBot() {
    let user: ITradingActor = {
        publicKey: "",
        privateKey: ""
    }

    let actor = new TradingActor("wss://ropsten.infura.io/ws/v3/d9293cfafa6d42888040bb4980c5d8cd", user, TradingContractAddress, TradingContractABI, 3)
    let pairPricer = new PairPricer("wss://mainnet.infura.io/ws/v3/d9293cfafa6d42888040bb4980c5d8cd", UniswapContractABI)

    while (1) {
        try {
            // wait for event
            let response = await actor.getEventOutput("requestData")

            var startTime = performance.now()

            // call uniswap contract
            let uniswapResponse: UniswapPoolResponse = await pairPricer.selectTokenPair(response.tknPair)
            if (uniswapResponse.price === "NaN") {
                console.log("ERROR: Switch Case Failed for Uniswap")
                continue;
            }
            console.log(uniswapResponse)
            actor.callback(response.id, uniswapResponse.price)

            var endTime = performance.now()
            console.log(`Workflow took ${endTime - startTime} milliseconds`)
        } catch (e) {
            console.log(e)
        }
    }
}

startBot()
