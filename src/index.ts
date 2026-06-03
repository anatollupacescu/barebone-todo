import App, { Form } from "./app";
import Client from "./client";
import { TodoList } from "./todolist";

document.addEventListener("DOMContentLoaded", function init() {
  const form = document.querySelector<HTMLFormElement>("#mainForm");
  if (!form) throw new Error("#mainForm not found");

  const text = document.querySelector<HTMLInputElement>("#todoText");
  if (!text) throw new Error("#todoText not found");

  const addBtn = document.querySelector<HTMLButtonElement>("#addBtn");
  if (!addBtn) throw new Error("#addBtn not found");

  const errorMsg = document.querySelector<HTMLElement>(".error-message");
  if (!errorMsg) throw new Error(".error-message not found");

  const tableEl = document.querySelector<HTMLElement>("#table");
  if (!tableEl) throw new Error("#table not found");

  const deleteBtn = document.querySelector<HTMLButtonElement>("#deleteBtn");
  if (!deleteBtn) throw new Error("#deleteBtn not found");

  const appForm: Form = {
    setReady: (b: boolean): void => {
      addBtn.disabled = !b;
    },

    lockInput: (b: boolean): void => {
      text.disabled = b;
    },

    markInvalid: (): void => {
      text.classList.add("is-invalid", "border-red-500");
      errorMsg.classList.remove("hidden");
    },

    markValid: (): void => {
      text.classList.remove("is-invalid", "border-red-500");
      errorMsg.classList.add("hidden");
    },

    resetInput: (): void => {
      text.value = "";
    },
  };

  const todoList = new TodoList(tableEl, deleteBtn);
  const client = new Client();
  const app = new App(appForm, todoList, client);

  text.addEventListener("input", () => {
    app.onChange(text.value);
  });

  text.addEventListener("invalid", (event: Event) => {
    event.preventDefault();
    app.onInvalid();
  });

  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      app.onInvalid();
      return;
    }
    app.onSubmit(text.value);
  });

  app.load();
});
