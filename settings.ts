import {ITradingActor} from "./types/trading-actor.ts";

export const user: ITradingActor = {
    publicKey: "",
    privateKey: ""
}
export const actorNet = {
    url: "wss://rinkeby.infura.io/ws/v3/",
    netID: 4
}
export const pairPricerNet = {
    url: "wss://mainnet.infura.io/ws/v3/"
}

export const loopSleepSeconds: number = 60

export const defaultPriority: number = 1.25