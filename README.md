# 🦕 Trading-Actor for Volatility Farming

## Run

**Requirements**

- deno (when using source code)

### Binary

1. Download a release version
2. Rename `.env.example` to `.env` and adjust the parameters
3. Run `./main` and access the API with `http://localhost:HTTPPort`

### Source

1. Clone repository
2. Rename `.env.example` to `.env` and adjust the parameters
3. Run command below and access the API with `http://localhost:HTTPPort`

```
deno run --allow-net --allow-read --allow-write --allow-env=publicAddress,privateKey,tradingActorUrl,tradingActorNetID,tradingActorContractAddress,ERC20TokenAddressPrimary,ERC20TokenAddressSecondary,pairPricerUrl,pairPricerNetID,sleepSeconds,defaultPriority,HTTPPort main.ts
```

## Build

```
deno bundle main.ts main.bundled.ts
deno compile --allow-net --allow-read --allow-write --allow-env=publicAddress,privateKey,tradingActorUrl,tradingActorNetID,tradingActorContractAddress,ERC20TokenAddressPrimary,ERC20TokenAddressSecondary,pairPricerUrl,pairPricerNetID,sleepSeconds,defaultPriority,HTTPPort --output main --no-check main.bundled.ts
```
