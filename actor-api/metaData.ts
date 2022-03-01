import { Storage } from '../contract-actor/components/storage.ts';
import { Opine } from 'https://raw.githubusercontent.com/ntrotner/opine/main/src/types.ts';
import { actorNet, tradingActorExplorer } from '../contract-actor/components/settings.ts';

/**
 * defines endpoints for meta data that is linked to display information
 *
 * @param app
 */
export function initializeMetaDataAPI(app: Opine): Opine {
  app.get('/primaryName', async (_, res) => {
    try {
      res.json(await Storage.getPrimaryName());
    } catch {
      res.json(null);
    }
  });

  app.get('/secondaryName', async (_, res) => {
    try {
      res.json(await Storage.getSecondaryName());
    } catch {
      res.json(null);
    }
  });

  app.get('/contractName', async (_, res) => {
    try {
      res.json(await Storage.getContractName());
    } catch {
      res.json(null);
    }
  });

  app.get('/tradingActorExplorer', (_, res) => {
    try {
      res.json(tradingActorExplorer);
    } catch {
      res.json(null);
    }
  });

  app.get('/chainID', (_, res) => {
    try {
      res.json(actorNet.netID);
    } catch {
      res.json(null);
    }
  });

  app.get('/priority', async (_, res) => {
    try {
      res.json(await Storage.getPriority());
    } catch {
      res.json(null);
    }
  });

  app.get('/count', async (_, res) => {
    try {
      res.send(String(await Storage.getIterationCounter()));
    } catch {
      res.json(null);
    }
  });

  app.get('/priceCount', async (_, res) => {
    try {
      res.send(String(await Storage.getPriceCounter()));
    } catch {
      res.json(null);
    }
  });

  return app;
}
