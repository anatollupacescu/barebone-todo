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

  let button: HTMLButtonElement | null = document.querySelector('#addBtn');
  if (!button) {
    throw new Error("#addBtn not found");
  }

  let table: Element | null = document.querySelector("#table");
  if (!table) {
    throw new Error("#table not found");
  }

  let page: Page = {
    textValue: (): string => text.value,

    resetText: (): void => { text.value = "" },

    // only the button tracks validity state — input is never disabled by validation
    setReady: (b: boolean): void => {
      button.disabled = !b;
    },

    // input is locked only during fetch in-flight to prevent edits mid-request
    lockInput: (b: boolean): void => {
      text.disabled = b;
    },

    markInvalid: (): void => {
      text.classList.add("is-invalid");
    },

    markValid: (): void => {
      text.classList.remove("is-invalid");
    },

    isValid: (): boolean => form.checkValidity(),

    renderTable: (data: string[]): void => {
      let result = data.map(d => `<li class="list-item">${d}</li>`).join("");
      table.innerHTML = `<ol>${result}</ol>`;
    },
  };

  let client = new Client();
  let app = new App(page, client);

  // 'input' fires on any value change: typing, paste, drag-drop, autocomplete
  text.addEventListener('input', () => {
    app.onChange();
  });

  // browser fires 'invalid' per-field when checkValidity() fails or submit is blocked
  // preventDefault suppresses the browser's native callout bubble
  text.addEventListener('invalid', (event: Event) => {
    event.preventDefault();
    app.onInvalid();
  });

  // submit only fires if the browser's own checkValidity() passed (because of novalidate
  // we handle it manually via form.checkValidity() in page.isValid, but type="submit"
  // on the button still triggers constraint checking before the event reaches here)
  form.addEventListener('submit', (event: Event) => {
    event.preventDefault();
    app.onSubmit();
  });

  app.load();
});
