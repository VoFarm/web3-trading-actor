export interface Iteration {
  tx: ITransaction[];
  traded: string;
  messages: string[];
  startDate: Date;
  seconds: number;
  success: boolean;
  inProgress: boolean;
}

export interface ITransaction {
  tx: string;
  descriptor: string;
  gasPrice: number;
  gasLimit: number;
}

export function Iteration(): Iteration {
  return {
    messages: [],
    traded: '',
    tx: [],
    startDate: new Date(),
    seconds: 0,
    success: false,
    inProgress: true,
  };
}
