import Client from "./client";
import { TodoList } from "./todolist";

export interface Form {
  setReady(_: boolean): void;
  lockInput(_: boolean): void;
  markInvalid(): void;
  markValid(): void;
  resetInput(): void;
}

export default class App {
  private form: Form;
  private client: Client;
  private list: TodoList;

  constructor(form: Form, list: TodoList, client: Client) {
    this.form = form;
    this.list = list;
    this.client = client;
    list.onDone(id => this.onDone(id));
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

  onChange(value: string) {
    const valid = value.trim().length > 0;
    if (valid) {
      this.form.markValid();
      this.form.setReady(true);
    } else {
      this.onInvalid();
    }
  }

  onInvalid() {
    this.form.markInvalid();
    this.form.setReady(false);
  }

  onSubmit(title: string) {
    this.form.setReady(false);
    this.form.lockInput(true);

    this.client
      .add(title)
      .then((data) => {
        this.list.setItems(data);
        this.form.resetInput();       // ← new method on Form
        this.form.markValid();
        this.form.setReady(false);
        this.form.lockInput(false);
      })
      .catch((error) => {
        console.error("could not add todo item", error);
      });
  }

  onDone(id: number) {
    this.client
      .markDone(id)
      .then(() => this.client.fetchAll())
      .then((data) => {
        this.list.setItems(data);
      })
      .catch((error) => {
        console.error('could not mark item done', error);
      });
  }

  onDelete(ids: number[]) {
    this.client
      .deleteItems(ids)
      .then(() => this.client.fetchAll())
      .then((data) => {
        this.list.setItems(data);
      })
      .catch((error) => {
        console.error('could not delete items', error);
      });
  }
}
