export interface Immutables {
    factory: string;
    token0: string;
    token1: string;
    fee: number;
    tickSpacing: number;
    maxLiquidityPerTick: string;
}

export interface UniswapPoolResponse {
    price: string
}