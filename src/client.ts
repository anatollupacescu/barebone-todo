export interface TodoItem {
  id: number;
  title: string;
  date: string;
  done: boolean;
}

export default class Client {
  private url = 'http://localhost:3000/todo';

  async fetchAll(): Promise<TodoItem[]> {
    const response = await fetch(this.url);
    return response.json();
  }

  async add(title: string): Promise<TodoItem[]> {
    await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify({
        title,
        date: new Date(),
        done: false
      }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' }
    });
    return this.fetchAll();
  }

  async markDone(id: number): Promise<void> {
    await fetch(`${this.url}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done: true }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' }
    });
  }

  async deleteItems(ids: number[]): Promise<void> {
    for (const id of ids) {
      await fetch(`${this.url}/${id}`, { method: 'DELETE' });
    }
  }
}
