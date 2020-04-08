import Client from "./client"

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

  constructor(p: Page, c: Client) {
    this.page = p
    this.client = c
  }

  init() {
    this.client.fetchAll().then(data => {
      this.page.renderTable(data)
    })
      .catch(() => { console.error('could not fetch data') })
  }

  onChange() {
    let v = this.page.textValue()

    if (!v || v.trim().length === 0) {
      this.page.toggleError(true)
      this.page.toggleAddBtnEnabled(false)
      return
    }

    this.page.toggleError(false)
    this.page.toggleAddBtnEnabled(true)
  }

  onSubmit() {
    this.page.toggleInputEnabled(false)

    let todo = this.page.textValue()

    this.client.add(todo)
      .then((data) => {
        this.page.resetText()
        this.page.renderTable(data)
        this.page.toggleInputEnabled(true)
        this.page.toggleAddBtnEnabled(false)
      })
      .catch(() => { console.error('could not add todo item') })
  }
}