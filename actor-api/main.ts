import { opine } from 'https://raw.githubusercontent.com/ntrotner/opine/main/mod.ts';
import { opineCors } from 'https://deno.land/x/cors/mod.ts';
import { httpPort } from '../contract-actor/components/settings.ts';
import { initalizeIterationAPI } from './iteration.ts';
import { initializeLogAPI } from './log.ts';
import { initializeMetaDataAPI } from './metaData.ts';
import { initializePriceAPI } from './price.ts';

/**
 * start endpoints for public access
 */
export function main() {
  try {
    const app = opine();
    app.use(opineCors());

    initalizeIterationAPI(app);
    initializeLogAPI(app);
    initializeMetaDataAPI(app);
    initializePriceAPI(app);

    /**
     * health check
     */
    app.get('/', (_, res) => {
      res.sendStatus(200);
    });

    app.listen(httpPort, () => console.log(`Starting at: http://localhost:${ httpPort }`));
    return true
  } catch {
    return false
  }
}
