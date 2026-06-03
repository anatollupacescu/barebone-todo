import Client from "./client";
import { TodoList } from "./todolist";

export interface Page {
  textValue(): string;
  resetText(): void;
  setReady(_: boolean): void;
  lockInput(_: boolean): void;
  markInvalid(): void;
  markValid(): void;
  isValid(): boolean;
}

export default class App {
  private page: Page;
  private client: Client;
  private list: TodoList;

  constructor(p: Page, list: TodoList, c: Client) {
    this.page = p;
    this.list = list;
    this.client = c;
    list.onDone(i => this.onDone(i));
    list.onDelete(ids => this.onDelete(ids));
  }

  load() {
    this.client
      .fetchAll()
      .then((data) => {
        this.list.setItems(data);
      })
      .catch(() => {
        console.error("could not fetch data");
      });
  }

  onChange() {
    if (this.page.isValid()) {
      this.page.markValid();
      this.page.setReady(true);
    } else {
      this.page.setReady(false);
    }
  }

  onInvalid() {
    this.page.markInvalid();
    this.page.setReady(false);
  }

  onDone(id: number) {
    this.client
      .markDone(id)
      .then(() => this.client.fetchAll())
      .then((data) => {
        this.list.setItems(data);
      })
      .catch(() => {
        console.error('could not mark item done');
      });
  }

  onDelete(ids: number[]) {
    this.client
      .deleteItems(ids)
      .then(() => this.client.fetchAll())
      .then((data) => {
        this.list.setItems(data);
      })
      .catch(() => {
        console.error('could not delete items');
      });
  }

  onSubmit() {
    this.page.setReady(false);

    if (!this.page.isValid()) {
      this.page.markInvalid();
      return;
    }

    this.page.lockInput(true);

    this.client
      .add(this.page.textValue())
      .then((data) => {
        this.page.resetText();
        this.page.markValid();
        this.list.setItems(data);
        this.page.lockInput(false);
      })
      .catch(() => {
        console.error("could not add todo item");
      });
  }
}
