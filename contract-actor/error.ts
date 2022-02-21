import { Storage } from './components/storage.ts';
import { NOTMINED, UNDERPRICED } from '../types/errors.ts';

/**
 * defines how to handle an error in an iteration
 *
 * @param iterationID
 * @param message
 */
export async function handleError(iterationID: number, message: string) {
  await Storage.addMessageToIteration(iterationID, message);
  await Storage.setSuccessIteration(iterationID, false);
  if (message === NOTMINED || message === UNDERPRICED) {
    await Storage.increasePriority(5);
  }
}
