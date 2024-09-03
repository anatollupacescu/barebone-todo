import App, { Page } from "./app";
import Client from "./client";

document.addEventListener("DOMContentLoaded", function init() {
  let form: HTMLFormElement | null = document.querySelector("#mainForm");

  if (!form) {
    throw new Error("#mainForm not found");
  }

  let text: HTMLInputElement | null = document.querySelector("#todoText");

  if (!text) {
    throw new Error("#todoText not found");
  }

  let button: HTMLInputElement | null = document.querySelector('#addBtn')
  if (!button) {
    throw new Error("#todoText not found");
  }

  let page: Page = {
    textValue: (): string => getTextValue(text),
    resetText: (): void => resetText(text),
    toggleInputEnabled: (b: boolean) => setInputEnabled(text, b),
    toggleAddBtnEnabled: (b: boolean) => setAddBtnEnabled(button, b),
    toggleError: (b: boolean): void => toggleError(text, b),
    renderTable: (data: string[]): void => renderTable(data),
  };

  let client = new Client();
  let app = new App(page, client);

  form.onsubmit = (event: Event) => {
    event.preventDefault();
    app.onSubmit();
  };

  text.onkeyup = () => {
    app.onChange();
  };

  app.load();
});

function renderTable(data: string[]) {
  let result = data.map((d) => `<li class="list-item">${d}</li>`).join("");
  const table = document.querySelector("#table");
  if (table) {
    table.innerHTML = `<ol>${result}</ol>`;
  }
}

function getTextValue(e: HTMLInputElement): string {
  return e.value;
}

function resetText(e: HTMLInputElement): void {
  e.value = "";
}

function toggleError(e: HTMLInputElement, b: boolean) {
  if (b) {
    e.classList.add("is-invalid");
    return;
  }
  e.classList.remove("is-invalid");
}

function setInputEnabled(e: HTMLInputElement, enabled: boolean) {
  e.disabled = !enabled;
}

function setAddBtnEnabled(e: HTMLInputElement, enabled: boolean) {
  e.disabled = !enabled;
}
