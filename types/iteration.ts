export enum IterationStatus {
    IN_PROGRESS = 0,
    DONE = 1
}

export enum IterationType {
    PRICE = 0,
    TRADE = 1
}

export interface Iteration {
    type: IterationType
    status: IterationStatus,
    messages: string[],
    transactionID: string,
    nonce: number
}