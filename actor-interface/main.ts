import { opine, serveStatic } from 'https://raw.githubusercontent.com/ntrotner/opine/main/mod.ts';
import { dirname, join } from 'https://raw.githubusercontent.com/ntrotner/opine/main/deps.ts';
import { opineCors } from 'https://deno.land/x/cors/mod.ts';
import { Storage } from '../contract-actor/components/storage.ts';

export function main() {
  const app = opine();
  const __dirname = dirname(import.meta.url);
  app.use(opineCors());
  app.use(serveStatic(join(__dirname, '../dist')));

  app.use('/', serveStatic(join(__dirname, '../dist')));

  app.get('/log', (req, res) => {
    res.json(Storage.getConsoleLog(req.query.id));
  });

  app.get('/iteration', (req, res) => {
    res.json(Storage.getIteration(req.query.id));
  });

  app.get('/priority', (_, res) => {
    res.json(Storage.getPriority());
  });

  app.get('/count', (_, res) => {
    res.send(String(Storage.getIterationCounter()));
  });

  app.listen(3001, () => console.log('Starting at: http://localhost:3001'));
}
