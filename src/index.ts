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
    throw new Error("#addBtn not found");
  }

  let table: Element | null = document.querySelector("#table");
  if (!table) {
    throw new Error("#table not found");
  }

  let page: Page = {
    textValue: (): string => getTextValue(text),
    resetText: (): void => resetText(text),
    setReady: (b: boolean): void => {
      setInputEnabled(text, b);
      setAddBtnEnabled(button, b);
    },
    setError: (b: boolean): void => toggleError(text, b),
    renderTable: (data: string[]): void => renderTable(table, data),
  };

  let client = new Client();
  let app = new App(page, client);

  form.addEventListener('submit', (event: Event) => {
    event.preventDefault();
    app.onSubmit();
  });

  text.addEventListener('input', () => {
    app.onChange();
  });

  app.load();
});

function renderTable(table: Element, data: string[]) {
  let result = data.map((d) => `<li class="list-item">${d}</li>`).join("");
  table.innerHTML = `<ol>${result}</ol>`;
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
