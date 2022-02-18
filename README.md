# 🦕 Trading-Actor for Volatility Farming

## Run

**Requirements**
- snel
- deno

### Binary
1. Download a release version
2. Rename `.env.example` to `.env` and adjust the parameters
3. Run `./main` and access the web interface with `http://localhost:3001`


### Source
1. Clone repository
2. Rename `.env.example` to `.env` and adjust the parameters
3. Run command below and access the web interface with `http://localhost:3001`
```
cd actor-interface && snel build && mv dist ../ && cd ..
deno --allow-net --allow-read --allow-write --allow-env=publicAddress,privateKey,actorUrl,actorNetID,pairPricerUrl,pairPricerNetID,sleepSeconds,defaultPriority main.ts
```

## Build

```
cd actor-interface && snel build && mv dist ../ && cd ..
deno bundle main.ts main.bundled.ts
deno compile --allow-net --allow-read --allow-write --allow-env=publicAddress,privateKey,actorUrl,actorNetID,pairPricerUrl,pairPricerNetID,sleepSeconds,defaultPriority --output main --no-check main.bundled.ts
```
