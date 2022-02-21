import { Storage } from '../contract-actor/components/storage.ts';
import { Opine } from 'https://raw.githubusercontent.com/ntrotner/opine/main/src/types.ts';

/**
 * add all endpoints to the app related to the console log saved in the storage
 */
export function initializeLogAPI(app: Opine): Opine {
  /**
   * return console log at position ?id=number
   *
   * @returns string
   */
  app.get('/log', async (req, res) => {
    try {
      res.json(await Storage.getConsoleLog(Number(req.query.id)));
    } catch {
      // return null if number wasn't valid or out of range
      res.json(null);
    }
  });

  /**
   * returns all console logs starting at position ?lastID=number
   *
   * @returns string[]
   */
  app.get('/logRange', async (req, res) => {
    try {
      const allLogs: (string | null)[] = [];
      const counter = await Storage.getConsoleCounter();
      const lastID = Number(req.query.lastID);

      // return empty if id isn't in range
      if (counter < lastID) {
        res.json([]);
        return;
      }

      // get past logs
      for (let i = counter; i >= ((counter - lastID) < 0 ? 0 : (counter - lastID)); i--) {
        allLogs.push(await Storage.getConsoleLog(i));
      }

      // return list of logs
      res.json(allLogs);
    } catch {
      // return empty list if number couldn't be parsed or storage error
      res.json([]);
    }
  });
  return app;
}
