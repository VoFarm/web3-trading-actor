import { Iteration, ITransaction } from '../../types/iteration.ts';
import { defaultPriority, tradingActorContractAddress } from './settings.ts';
import {
  CONSOLECOUNTER,
  CONSOLEDESCRIPTOR,
  CONTRACTNAME,
  ITERATIONCOUNTER,
  ITERATIONDESCRIPTOR,
  Price,
  PRICECOUNTER,
  PRICEDESCRIPTOR,
  PRIMARYNAME,
  PRIORITY,
  SECONDARYNAME,
} from '../../types/storage.ts';
import { Store } from 'https://raw.githubusercontent.com/acathur/store/master/mod.ts';

const store = new Store({
  name: `${tradingActorContractAddress}.json`,
  path: './storage',
});

export class Storage {
  /**
   * initialize storage to a default state if nothing is set
   *
   * @private
   */
  public static async initializeStorage() {
    // set counter for the console log
    if (!await store.get(CONSOLECOUNTER)) {
      await store.set(CONSOLECOUNTER, `${CONSOLEDESCRIPTOR}-1`);
    }

    // set counter for the iteration
    if (!await store.get(ITERATIONCOUNTER)) {
      await store.set(ITERATIONCOUNTER, `${ITERATIONDESCRIPTOR}-1`);
    }

    // set counter for the price
    if (!await store.get(PRICECOUNTER)) {
      await store.set(PRICECOUNTER, `${PRICEDESCRIPTOR}-1`);
    }

    // always reset priority to default value after initialization
    await store.set(PRIORITY, JSON.stringify(defaultPriority));
  }

  /**
   * stringifies the input and writes it to the local storage
   *
   * @param key
   * @param input
   * @private
   */
  private static async writeObject(key: string, input: Record<string, unknown> | number | string) {
    await store.set(key, JSON.stringify(input));
  }

  /**
   * increment counter for iterations
   *
   * @private
   */
  private static async incrementIterationCounter(): Promise<number> {
    const iterationCounter = (await this.getIterationCounter()) + 1;
    await store.set(ITERATIONCOUNTER, `${ITERATIONDESCRIPTOR}${iterationCounter}`);
    return iterationCounter;
  }

  /**
   * increment counter for console log
   *
   * @private
   */
  private static async incrementConsoleCounter(): Promise<number> {
    const consoleCounter = (await this.getConsoleCounter()) + 1;
    await store.set(CONSOLECOUNTER, `${CONSOLEDESCRIPTOR}${consoleCounter}`);
    return consoleCounter;
  }

  /**
   * increment counter for price
   *
   * @private
   */
  private static async incrementPriceCounter(): Promise<number> {
    const priceCounter = (await this.getPriceCounter()) + 1;
    await store.set(PRICECOUNTER, `${PRICEDESCRIPTOR}${priceCounter}`);
    return priceCounter;
  }

  /**
   * returns the iteration at 'iterationID'
   *
   * @param iterationID
   */
  public static async getIteration(iterationID: number): Promise<Iteration | null> {
    try {
      // return undefined if key is out of range
      if (iterationID > await this.getIterationCounter() || iterationID < 0) {
        return null;
      }

      return JSON.parse(await store.get(`${ITERATIONDESCRIPTOR}${iterationID}`) as string);
    } catch {
      // catch if item couldn't be parsed
      return null;
    }
  }

  /**
   * returns the console log at 'consoleLogID'
   *
   * @param consoleLogID
   */
  public static async getConsoleLog(consoleLogID: number): Promise<string | null> {
    try {
      // return undefined if key is out of range
      if (consoleLogID > await this.getConsoleCounter() || consoleLogID < 0) {
        return null;
      }

      return await store.get(`${CONSOLEDESCRIPTOR}${consoleLogID}`);
    } catch {
      return null;
    }
  }

  /**
   * returns the console log at 'consoleLogID'
   *
   * @param priceID
   */
  public static async getPrice(priceID: number): Promise<Price | null> {
    try {
      // return undefined if key is out of range
      if (priceID > await this.getPriceCounter() || priceID < 0) {
        return null;
      }

      return JSON.parse(await store.get(`${PRICEDESCRIPTOR}${priceID}`));
    } catch {
      return null;
    }
  }

  /**
   * return latest iteration id
   */
  public static async getIterationCounter(): Promise<number> {
    return Number(String(await store.get(ITERATIONCOUNTER)).slice(1));
  }

  /**
   * return latest console log id
   */
  public static async getConsoleCounter(): Promise<number> {
    return Number((await store.get(CONSOLECOUNTER) as string).slice(1));
  }

  /**
   * return latest price id
   */
  public static async getPriceCounter(): Promise<number> {
    return Number((await store.get(PRICECOUNTER) as string).slice(1));
  }

  /**
   * return current priority
   */
  public static async getPriority(): Promise<number> {
    return Number(await store.get(PRIORITY));
  }

  /**
   * increase priority by setting a higher multiplier for the gas price
   *
   * Example
   * newPriority = percentage / 100 + previousPriority
   * 1.20        =     5      / 100 + 1.15
   *
   * @param percentage
   */
  public static async increasePriority(percentage: number) {
    await this.writeObject(PRIORITY, (await this.getPriority()) + (percentage / 100));
  }

  /**
   * reset priority to the specified value in settings
   */
  public static async resetPriority() {
    await this.writeObject(PRIORITY, defaultPriority);
  }

  /**
   * write primary name of swapable token
   *
   * @param name
   */
  public static async setPrimaryName(name: string) {
    await this.writeObject(PRIMARYNAME, name);
  }

  /**
   * get primary name of swapable token
   */
  public static async getPrimaryName() {
    return await store.get(PRIMARYNAME);
  }

  /**
   * write secondary name of swapable token
   *
   * @param name
   */
  public static async setSecondaryName(name: string) {
    await this.writeObject(SECONDARYNAME, name);
  }

  /**
   * get secondary name of swapable token
   */
  public static async getSecondaryName() {
    return await store.get(SECONDARYNAME);
  }

  /**
   * write name of contract
   *
   * @param name
   */
  public static async setContractName(name: string) {
    await this.writeObject(CONTRACTNAME, name);
  }

  /**
   * get name of contract
   */
  public static async getContractName() {
    return await store.get(CONTRACTNAME);
  }

  /**
   * writes new console log to the storage
   *
   * returns position of new console log
   * @param message
   */
  public static async consoleLog(message: string): Promise<number> {
    const date = new Date();
    const consoleLogPosition = await this.incrementConsoleCounter();
    await this.writeObject(`${CONSOLEDESCRIPTOR}${consoleLogPosition}`, `${date.toDateString()} ${date.toTimeString()} | ${message}`);
    return consoleLogPosition;
  }

  /**
   * adds a new iteration into the storage
   *
   * returns position of new iteration
   * @param iteration
   */
  public static async newIteration(iteration: Iteration): Promise<number> {
    const iterationPosition = await this.incrementIterationCounter();
    await this.writeObject(`${ITERATIONDESCRIPTOR}${iterationPosition}`, iteration);
    return iterationPosition;
  }

  /**
   * adds a new price into the storage
   *
   * returns position of new price
   * @param price
   */
  public static async newPrice(price: Price): Promise<number> {
    const pricePosition = await this.incrementPriceCounter();
    await this.writeObject(`${PRICEDESCRIPTOR}${pricePosition}`, JSON.stringify(price));
    return pricePosition;
  }

  /**
   * add new message to an iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param message
   */
  public static async addMessageToIteration(iterationID: number, message: string): Promise<boolean> {
    try {
      const iteration: Iteration | null = await this.getIteration(iterationID);
      if (!iteration) return false;

      const date = new Date();
      iteration.messages.push(`${date.toDateString()} ${date.toTimeString()} | ${message}`);
      await this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * add new transaction related to the iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param tx
   */
  public static async addTransactionToIteration(iterationID: number, tx: ITransaction): Promise<boolean> {
    try {
      const iteration: Iteration | null = await this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.tx.push(tx);

      await this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * set success in iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param success
   */
  public static async setSuccessIteration(iterationID: number, success: boolean): Promise<boolean> {
    try {
      const iteration: Iteration | null = await this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.success = success;

      await this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * set trade status in iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param traded
   */
  public static async setTradedIteration(iterationID: number, traded: string): Promise<boolean> {
    try {
      const iteration: Iteration | null = await this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.traded = traded;

      await this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * set execution time for iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param seconds
   */
  public static async setPerformanceIteration(iterationID: number, seconds: number): Promise<boolean> {
    try {
      const iteration: Iteration | null = await this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.seconds = seconds;

      await this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * set progression for iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param inProgress
   */
  public static async setInProgressIteration(iterationID: number, inProgress: boolean): Promise<boolean> {
    try {
      const iteration: Iteration | null = await this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.inProgress = inProgress;

      await this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }
}
