import { Storage } from '../contract-actor/components/storage.ts';
import { Price } from '../types/storage.ts';
import { Opine } from 'https://raw.githubusercontent.com/ntrotner/opine/main/src/types.ts';

/**
 * add all endpoints to the app related to the price and token amounts
 */
export function initializePriceAPI(app: Opine): Opine {
  /**
   * returns the amount of tokens at position ?id=number
   *
   * @returns Price
   */
  app.get('/price', async (req, res) => {
    try {
      res.json(await Storage.getPrice(req.query.id));
    } catch {
      // return null if number wasn't valid or out of range
      res.json(null);
    }
  });

  /**
   * returns all prices starting at position ?lastID=number and ending at ?earliestID=number
   *
   * @returns Price[]
   */
  app.get('/priceRange', async (req, res) => {
    try {
      const allPrices: (Price | null)[] = [];
      const counter = await Storage.getPriceCounter();
      const lastID = Number(req.query.lastID);
      const earliestID = Number(req.query.earliestID);

      // return empty if id isn't in range
      if (counter < lastID || counter > earliestID || earliestID < lastID) {
        res.json([]);
        return;
      }

      // get past prices
      for (let i = earliestID; i >= (lastID < 0 ? 0 : lastID); i--) {
        allPrices.push(await Storage.getPrice(i));
      }

      // return list of prices
      res.json(allPrices);
    } catch {
      // return empty list if number couldn't be parsed or storage error
      res.json([]);
    }
  });

  return app;
}
