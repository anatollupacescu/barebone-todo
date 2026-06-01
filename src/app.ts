import Client from "./client"

export interface Page {
  textValue(): string
  resetText(): void
  setReady(_: boolean): void
  setError(_: boolean): void
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
    this.client.fetchAll().then(data => {
      this.page.renderTable(data)
    })
      .catch(() => { console.error('could not fetch data') })
  }

  onChange() {
    let valid = this.page.textValue().trim().length > 0
    this.page.setError(!valid)
    this.page.setReady(valid)
  }

  onSubmit() {
    this.page.setReady(false)

    let todo = this.page.textValue()

    this.client.add(todo)
      .then((data) => {
        this.page.resetText()
        this.page.renderTable(data)
        this.page.setReady(true)
        this.page.setError(false)
      })
      .catch(() => { console.error('could not add todo item') })
  }
}
