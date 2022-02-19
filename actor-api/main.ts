import { opine, serveStatic } from 'https://raw.githubusercontent.com/ntrotner/opine/main/mod.ts';
import { dirname } from 'https://raw.githubusercontent.com/ntrotner/opine/main/deps.ts';
import { opineCors } from 'https://deno.land/x/cors/mod.ts';
import { Storage } from '../contract-actor/components/storage.ts';
import { httpPort } from '../contract-actor/components/settings.ts';

export function main() {
  const app = opine();
  const __dirname = dirname(import.meta.url);
  app.use(opineCors());

  app.get('/log', async (req, res) => {
    res.json(await Storage.getConsoleLog(req.query.id));
  });

  app.get('/iteration', async (req, res) => {
    res.json(await Storage.getIteration(req.query.id));
  });

  app.get('/price', async (req, res) => {
    res.json(await Storage.getPrice(req.query.id));
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
