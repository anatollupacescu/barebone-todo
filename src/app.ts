import Client from "./client"
import FSM, { State } from "./fsm"

export interface Page {
  textValue(): string
  resetText(): void
  toggleInputEnabled(_: boolean): void
  toggleAddBtnEnabled(_: boolean): void
  toggleError(_: boolean): void
  renderTable(_: string[]): void
}

export default class App {
  private page: Page
  private client: Client
  private fsm: FSM

  constructor(p: Page, c: Client) {
    this.page = p
    this.client = c
    this.fsm = new FSM(this.config())
  }

  init() {
    this.client.fetchAll().then(data => {
      this.page.renderTable(data)
    })
      .catch(() => { console.error('could not fetch data') })
  }

  onChange() {
    this.fsm.on("change")
  }

  onSubmit() {
    this.fsm.on("submit")
  }

  config(): State {
    let valid: State = new State(),
      empty: State = new State(),
      initial: State = new State()

    initial.transitionTable = {
      "change": () => { if (this.inputIsEmpty()) return empty; return valid },
      "submit": () => { throw 'unexpected' }
    }

    valid.effect = () => {
      this.page.toggleError(false)
      this.page.toggleAddBtnEnabled(true)
    }

    valid.transitionTable = {
      "change": () => { if (this.inputIsEmpty()) return empty },
      "submit": this.submit(valid)
    }

    empty.effect = () => {
      this.page.toggleError(true)
      this.page.toggleAddBtnEnabled(false)
    }

    empty.transitionTable = {
      "change": () => { if (!this.inputIsEmpty()) return valid },
      "submit": () => { throw 'unexpected' }
    }

    return initial
  }

  inputIsEmpty(): boolean {
    let s = this.page.textValue()
    return !s || s.trim().length === 0
  }

  submit(success: State) {
    return () => {
      let v = this.page.textValue()
      this.page.toggleInputEnabled(false)
      this.client.add(v).then(data => {
        this.page.resetText()
        this.page.renderTable(data)
        this.page.toggleInputEnabled(true)
        this.page.toggleAddBtnEnabled(false)
      })
        .catch(() => console.error('could not add new todo'))

      return success
    }
  }
}