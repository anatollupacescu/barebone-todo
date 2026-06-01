import Client from "./client"

export interface Page {
  textValue(): string
  resetText(): void
  setReady(_: boolean): void
  lockInput(_: boolean): void
  markInvalid(): void
  markValid(): void
  isValid(): boolean
  renderTable(_: string[]): void
}

export default class App {
  private page: Page
  private client: Client

  constructor(p: Page, c: Client) {
    this.page = p
    this.client = c
  }

  load() {
    this.client.fetchAll()
      .then(data => {
        this.page.renderTable(data)
      })
      .catch(() => { console.error('could not fetch data') })
  }

  onChange() {
    // browser has already evaluated the constraints — just reflect its verdict
    if (this.page.isValid()) {
      this.page.markValid()
      this.page.setReady(true)
    } else {
      this.page.setReady(false)
    }
  }

  onInvalid() {
    // browser blocked the submit and fired 'invalid' on the field
    this.page.markInvalid()
    this.page.setReady(false)
  }

  onSubmit() {
    // browser only reaches here if form.checkValidity() passed — no guard needed
    this.page.setReady(false)
    this.page.lockInput(true)

    this.client.add(this.page.textValue())
      .then(data => {
        this.page.resetText()
        this.page.markValid()
        this.page.renderTable(data)
        this.page.lockInput(false)
        this.page.setReady(true)
      })
      .catch(() => { console.error('could not add todo item') })
  }
}
