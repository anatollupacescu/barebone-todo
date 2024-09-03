
export default class Client {
  private data: string[]

  private url = 'http://localhost:3000/todo'

  constructor(init: string[] = []) {
    this.data = init
  }

  async fetchAll(): Promise<string[]> {
    const response = await fetch(this.url)
    const json = await response.json()
    this.data = json.map((t: { title: string }) => t.title)
    return this.data
  }

  async add(title: string): Promise<string[]> {
    const response = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify({
        id: this.data.length,
        title: title,
        date: new Date()
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    const json = await response.json()
    this.data = [...this.data, json.title]
    return this.data
  }
}