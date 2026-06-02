import App, { Page } from "./app";
import Client from "./client";
import { TodoList } from "./todolist";

const errorMsg: Element | null = document.querySelector(".error-message");

document.addEventListener("DOMContentLoaded", function init() {
  let form: HTMLFormElement | null = document.querySelector("#mainForm");
  if (!form) {
    throw new Error("#mainForm not found");
  }

  let text: HTMLInputElement | null = document.querySelector("#todoText");
  if (!text) {
    throw new Error("#todoText not found");
  }

  let button: HTMLButtonElement | null = document.querySelector("#addBtn");
  if (!button) {
    throw new Error("#addBtn not found");
  }

  let tableEl: Element | null = document.querySelector("#table");
  if (!tableEl) {
    throw new Error("#table not found");
  }

  let page: Page = {
    textValue: (): string => text.value,

    resetText: (): void => {
      text.value = "";
    },

    setReady: (b: boolean): void => {
      button.disabled = !b;
    },

    lockInput: (b: boolean): void => {
      text.disabled = b;
    },

    markInvalid: (): void => {
      text.classList.add("is-invalid", "border-red-500");
      errorMsg?.classList.remove("hidden");   // show error message
    },

    markValid: (): void => {
      text.classList.remove("is-invalid", "border-red-500");
      errorMsg?.classList.add("hidden");      // hide error message
    },

    isValid: (): boolean => form.checkValidity(),
  };

  let todoList = new TodoList(tableEl);
  let client = new Client();
  let app = new App(page, todoList, client);

  text.addEventListener("input", () => {
    app.onChange();
  });

  text.addEventListener("invalid", (event: Event) => {
    event.preventDefault();
    app.onInvalid();
  });

  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();
    app.onSubmit();
  });

  app.load();
});