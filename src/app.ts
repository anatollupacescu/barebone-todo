export interface Page {
  textValue(): string
  resetText(): void
  toggleError(_: boolean): void
  renderTable(_: string[]): void
}

export default class App {
  private page: Page
  private data: string[] = []

  constructor(p: Page) {
    this.page = p
  }

  onChange() {
    this.page.toggleError(false)
  }

  onSubmit() {
    let v = this.page.textValue()

    if (!v || v.length === 0) {
      this.page.toggleError(true)
      return
    }

    this.page.toggleError(false)
    this.page.resetText()

    this.data = [...this.data, v]
    this.page.renderTable([...this.data])
  }
}