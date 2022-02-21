import { opine } from 'https://raw.githubusercontent.com/ntrotner/opine/main/mod.ts';
import { opineCors } from 'https://deno.land/x/cors/mod.ts';
import { Storage } from '../contract-actor/components/storage.ts';
import { httpPort } from '../contract-actor/components/settings.ts';
import { Iteration } from "../types/iteration.ts";
import { Price } from "../types/storage.ts";

export function main() {
  const app = opine();
  app.use(opineCors());

  app.get('/log', async (req, res) => {
    res.json(await Storage.getConsoleLog(req.query.id));
  });

  app.get('/iteration', async (req, res) => {
    res.json(await Storage.getIteration(req.query.id));
  });

  app.get('/iterationRange', async (req, res) => {
    const allIterations: (Iteration | null)[] = []
    const counter = await Storage.getIterationCounter()
    const lastID = Number(req.query.lastID)


    if (counter < lastID) {
      res.json([]);
      return;
    }

    // get past iterations
    for (let i = counter; i >= ((counter - lastID) < 0 ? 0 : (counter - lastID)); i--) {
      allIterations.push(await Storage.getIteration(i))
    }

    res.json(allIterations);
  });

  app.get('/price', async (req, res) => {
    res.json(await Storage.getPrice(req.query.id));
  });

  app.get('/priceRange', async (req, res) => {
    const allPrices: (Price | null)[] = []
    const counter = await Storage.getPriceCounter()
    const lastID = Number(req.query.lastID)


    if (counter < lastID) {
      res.json([]);
      return;
    }

    // get past prices
    for (let i = counter; i >= ((counter - lastID) < 0 ? 0 : (counter - lastID)); i--) {
      allPrices.push(await Storage.getPrice(i))
    }

    res.json(allPrices);
  });

  app.get('/primaryName', async (req, res) => {
    res.json(await Storage.getPrimaryName());
  });

  app.get('/secondaryName', async (req, res) => {
    res.json(await Storage.getSecondaryName());
  });

  app.get('/contractName', async (req, res) => {
    res.json(await Storage.getContractName());
  });

  app.get('/priority', async (_, res) => {
    res.json(await Storage.getPriority());
  });

  app.get('/count', async (_, res) => {
    res.send(String(await Storage.getIterationCounter()));
  });

  app.get('/priceCount', async (_, res) => {
    res.send(String(await Storage.getPriceCounter()));
  });

  app.listen(httpPort, () => console.log(`Starting at: http://localhost:${ httpPort }`));
}
