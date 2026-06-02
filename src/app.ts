import Client from "./client";

export interface Page {
  textValue(): string;
  resetText(): void;
  setReady(_: boolean): void;
  lockInput(_: boolean): void;
  markInvalid(): void;
  markValid(): void;
  isValid(): boolean;
  renderTable(_: string[], done: Set<number>): void;
}

export default class App {
  private page: Page;
  private client: Client;
  private done: Set<number> = new Set();

  constructor(p: Page, c: Client) {
    this.page = p;
    this.client = c;
  }

  load() {
    this.client
      .fetchAll()
      .then((data) => {
        this.page.renderTable(data, this.done);
      })
      .catch(() => {
        console.error("could not fetch data");
      });
  }

  onChange() {
    // browser has already evaluated the constraints — just reflect its verdict
    if (this.page.isValid()) {
      this.page.markValid();
      this.page.setReady(true);
    } else {
      this.page.setReady(false);
    }
  }

  onInvalid() {
    // browser blocked the submit and fired 'invalid' on the field
    this.page.markInvalid();
    this.page.setReady(false);
  }

  onDone(index: number) {
    this.done.add(index);
    this.client
      .fetchAll()
      .then((data) => {
        this.page.renderTable(data, this.done);
      })
      .catch(() => {
        console.error("could not refresh after marking done");
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
        this.page.renderTable(data, this.done);
        this.page.lockInput(false);
      })
      .catch(() => {
        console.error("could not add todo item");
      });
  }
}