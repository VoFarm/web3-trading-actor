export interface Iteration {
  txPrice: string;
  txTrade: string;
  traded: string;
  messages: string[];
  startDate: Date;
  seconds: number;
  success: boolean;
  inProgress: boolean;
}

export function Iteration(): Iteration {
  return {
    messages: [],
    traded: "",
    txPrice: "",
    txTrade: "",
    startDate: new Date(),
    seconds: 0,
    success: false,
    inProgress: true,
  };
}
