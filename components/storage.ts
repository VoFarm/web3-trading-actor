import {Iteration, IterationStatus} from "../types/iteration.ts";

export class Storage {
    counter: number = 0

    private COUNTER = "counter"
    private CONSOLE = "console"

    constructor() {
        this.counter = Number(localStorage.getItem(this.COUNTER)) ?? 0
        if (!localStorage.getItem(this.COUNTER))
            localStorage.setItem(this.COUNTER, JSON.stringify(0))

        if (!localStorage.getItem(this.CONSOLE))
            localStorage.setItem(this.CONSOLE, JSON.stringify([]))

        console.log(`Storage Initialized at ${this.counter}`)
    }

    private writeObject(key: string, input: object | number | string) {
        localStorage.setItem(key, JSON.stringify(input))
    }

    public getIteration(key: string): Iteration {
        return JSON.parse(localStorage.getItem(key) as string)
    }

    private incrementCounter() {
        this.counter += 1
        this.writeObject(this.COUNTER, this.counter)
    }

    public getConsoleLog(): string[] {
        return JSON.parse(localStorage.getItem(this.CONSOLE) as string)
    }

    public addConsoleLog(message: string) {
        let logArray: string[] = this.getConsoleLog()
        let date = new Date()
        logArray.push(`${date.toDateString()} ${date.toTimeString()} | ${message}`)
        this.writeObject(this.CONSOLE, logArray)
    }

    public getCounter(): number {
        return this.counter
    }

    public addNewIteration(newIteration: Iteration): number {
        this.writeObject(this.counter.toString(), newIteration)
        this.incrementCounter()
        return (this.counter - 1)
    }

    public updateStatusIteration(key: number, status: IterationStatus): boolean {
        try {
            let iteration: Iteration = this.getIteration(key.toString())
            if (!iteration)
                return false
            iteration.status = status
            this.writeObject(key.toString(), iteration)
            return true
        } catch {
            return false
        }
    }

    public updateMessageIteration(key: number, message: string): boolean {
        try {
            let iteration: Iteration = this.getIteration(key.toString())
            if (!iteration)
                return false
            let date = new Date()
            iteration.messages.push(`${date.toDateString()} ${date.toTimeString()} | ${message}`)
            this.writeObject(key.toString(), iteration)
            return true
        } catch {
            return false
        }
    }

}