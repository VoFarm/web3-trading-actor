import { Iteration } from "../../types/iteration.ts";
import { defaultPriority } from "../../settings.ts";
import {
  CONSOLECOUNTER,
  CONSOLEDESCRIPTOR,
  ITERATIONCOUNTER,
  ITERATIONDESCRIPTOR,
  PRIORITY,
} from "../../types/storage.ts";

export class Storage {
  /**
   * initialize storage to a default state if nothing is set
   *
   * @private
   */
  public static initializeStorage() {
    // set counter for the console log
    if (!localStorage.getItem(CONSOLECOUNTER)) {
      localStorage.setItem(CONSOLECOUNTER, `${CONSOLEDESCRIPTOR}-1`);
    }

    // set counter for the iteration
    if (!localStorage.getItem(ITERATIONCOUNTER)) {
      localStorage.setItem(ITERATIONCOUNTER, `${ITERATIONDESCRIPTOR}-1`);
    }

    // always reset priority to default value after initialization
    localStorage.setItem(PRIORITY, JSON.stringify(defaultPriority));
  }

  /**
   * stringifies the input and writes it to the local storage
   *
   * @param key
   * @param input
   * @private
   */
  private static writeObject(key: string, input: object | number | string) {
    localStorage.setItem(key, JSON.stringify(input));
  }

  /**
   * increment counter for iterations
   *
   * @private
   */
  private static incrementIterationCounter(): number {
    const iterationCounter = this.getIterationCounter() + 1;
    localStorage.setItem(
      ITERATIONCOUNTER,
      `${ITERATIONDESCRIPTOR}${iterationCounter}`,
    );
    return iterationCounter;
  }

  /**
   * increment counter for console log
   *
   * @private
   */
  private static incrementConsoleCounter(): number {
    const consoleCounter = this.getConsoleCounter() + 1;
    localStorage.setItem(
      CONSOLECOUNTER,
      `${CONSOLEDESCRIPTOR}${consoleCounter}`,
    );
    return consoleCounter;
  }

  /**
   * returns the iteration at 'iterationID'
   *
   * @param iterationID
   */
  public static getIteration(iterationID: number): Iteration | null {
    try {
      // return undefined if key is out of range
      if (iterationID > this.getIterationCounter() || iterationID < 0) {
        return null;
      }

      return JSON.parse(
        localStorage.getItem(`${ITERATIONDESCRIPTOR}${iterationID}`) as string,
      );
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
  public static getConsoleLog(consoleLogID: number): string | null {
    try {
      // return undefined if key is out of range
      if (consoleLogID > this.getConsoleCounter() || consoleLogID < 0) {
        return null;
      }

      return localStorage.getItem(`${CONSOLEDESCRIPTOR}${consoleLogID}`);
    } catch {
      return null;
    }
  }

  /**
   * return latest iteration id
   */
  public static getIterationCounter(): number {
    return Number(String(localStorage.getItem(ITERATIONCOUNTER)).slice(1));
  }

  /**
   * return latest console log id
   */
  public static getConsoleCounter(): number {
    return Number((localStorage.getItem(CONSOLECOUNTER) as string).slice(1));
  }

  /**
   * return current priority
   */
  public static getPriority(): number {
    return Number(localStorage.getItem(PRIORITY));
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
  public static increasePriority(percentage: number) {
    this.writeObject(PRIORITY, this.getPriority() + (percentage / 100));
  }

  /**
   * reset priority to the specified value in settings
   */
  public static resetPriority() {
    this.writeObject(PRIORITY, defaultPriority);
  }

  /**
   * writes new console log to the storage
   *
   * returns position of new console log
   * @param message
   */
  public static consoleLog(message: string): number {
    let date = new Date();
    const consoleLogPosition = this.incrementConsoleCounter();
    this.writeObject(
      `${CONSOLEDESCRIPTOR}${consoleLogPosition}`,
      `${date.toDateString()} ${date.toTimeString()} | ${message}`,
    );
    return consoleLogPosition;
  }

  /**
   * adds a new iteration into the storage
   *
   * returns position of new iteration
   * @param iteration
   */
  public static newIteration(iteration: Iteration): number {
    const iterationPosition = this.incrementIterationCounter();
    this.writeObject(`${ITERATIONDESCRIPTOR}${iterationPosition}`, iteration);
    return iterationPosition;
  }

  /**
   * add new message to an iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param message
   */
  public static addMessageToIteration(
    iterationID: number,
    message: string,
  ): boolean {
    try {
      const iteration: Iteration | null = this.getIteration(iterationID);
      if (!iteration) return false;

      const date = new Date();
      iteration.messages.push(
        `${date.toDateString()} ${date.toTimeString()} | ${message}`,
      );
      this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * set txTrade in iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param tx
   */
  public static setTxTradeIteration(iterationID: number, tx: string): boolean {
    try {
      const iteration: Iteration | null = this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.txTrade = tx;

      this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * set txTrade in iteration
   *
   * returns bool whether it was successful
   *
   * @param iterationID
   * @param tx
   */
  public static setTxPriceIteration(iterationID: number, tx: string): boolean {
    try {
      const iteration: Iteration | null = this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.txPrice = tx;

      this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
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
  public static setSuccessIteration(
    iterationID: number,
    success: boolean,
  ): boolean {
    try {
      const iteration: Iteration | null = this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.success = success;

      this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
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
  public static setTradedIteration(
    iterationID: number,
    traded: string,
  ): boolean {
    try {
      const iteration: Iteration | null = this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.traded = traded;

      this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
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
  public static setPerformanceIteration(
    iterationID: number,
    seconds: number,
  ): boolean {
    try {
      const iteration: Iteration | null = this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.seconds = seconds;

      this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
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
  public static setInProgressIteration(
    iterationID: number,
    inProgress: boolean,
  ): boolean {
    try {
      const iteration: Iteration | null = this.getIteration(iterationID);
      if (!iteration) return false;

      iteration.inProgress = inProgress;

      this.writeObject(`${ITERATIONDESCRIPTOR}${iterationID}`, iteration);
      return true;
    } catch {
      return false;
    }
  }
}
