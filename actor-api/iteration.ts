import { Storage } from '../contract-actor/components/storage.ts';
import { Iteration } from '../types/iteration.ts';
import { Opine } from 'https://raw.githubusercontent.com/ntrotner/opine/main/mod.ts';

/**
 * add all endpoints to the app related to iterations
 */
export function initalizeIterationAPI(app: Opine): Opine {
  /**
   * returns an iteration at position ?id=number
   *
   * @returns Iteration
   */
  app.get('/iteration', async (req, res) => {
    try {
      res.json(await Storage.getIteration(Number(req.query.id)));
    } catch {
      // return null if number wasn't valid or out of range
      res.json(null);
    }
  });

  /**
   * returns all Iterations starting at position ?lastID=number and ending at ?earliestID=number
   *
   * @returns Iteration[]
   */
  app.get('/iterationRange', async (req, res) => {
    try {
      const allIterations: (Iteration | null)[] = [];
      const counter = await Storage.getIterationCounter();
      const lastID = Number(req.query.lastID);
      const earliestID = Number(req.query.earliestID);

      // return empty if id isn't in range
      if (counter < lastID || counter < earliestID || earliestID < lastID) {
        res.json([]);
        return;
      }

      // get past iterations
      for (let i = earliestID; i >= (lastID < 0 ? 0 : lastID); i--) {
        allIterations.push(await Storage.getIteration(i));
      }

      // return list of iterations
      res.json(allIterations);
    } catch {
      // return empty list if number couldn't be parsed or storage error
      res.json([]);
    }
  });

  return app;
}
