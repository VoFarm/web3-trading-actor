export interface Iteration extends Record<string, unknown> {
  tx: ITransaction[];
  traded: string;
  messages: Message[];
  startDate: Date;
  seconds: number;
  success: boolean;
  inProgress: boolean;
}

export interface ITransaction {
  tx: string | undefined;
  descriptor: string;
  gasPrice: number;
  gasLimit: number;
}

interface Message {
  message: string;
  date: Date;
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
