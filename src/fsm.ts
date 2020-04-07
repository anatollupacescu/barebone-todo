type TransitionTable = Record<string, NextStateFunc>

interface NextStateFunc {
  (): State | undefined;
}

export class State {
  effect: Function
  transitionTable: TransitionTable
}

export default class FSM {
  private current: State

  constructor(initial: State) {
    this.current = initial
  }

  on(e: string): void {
    let fns = this.current.transitionTable[e]
    let next = fns()
    if (next !== undefined) {
      next.effect()
      this.current = next
      return
    }
  }
}