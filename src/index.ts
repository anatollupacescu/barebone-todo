// index.ts
import { signal, effect, batch } from '@preact/signals-core';
import App, { Page } from "./app";
import Client from "./client";

document.addEventListener("DOMContentLoaded", function init() {
  let form: HTMLFormElement | null = document.querySelector("#mainForm");
  if (!form) throw new Error("#mainForm not found");

  let text: HTMLInputElement | null = document.querySelector("#todoText");
  if (!text) throw new Error("#todoText not found");

  let button: HTMLButtonElement | null = document.querySelector("#addBtn");
  if (!button) throw new Error("#addBtn not found");

  let table: Element | null = document.querySelector("#table");
  if (!table) throw new Error("#table not found");

  // ── signals ──────────────────────────────────────────────────────────────
  const todos = signal<string[]>([]);
  const done = signal<Set<number>>(new Set());
  const ready = signal<boolean>(false);
  const locked = signal<boolean>(false);
  const invalid = signal<boolean>(false);

  // ── effects: one DOM concern each ────────────────────────────────────────
  effect(() => { button.disabled = !ready.value; });

  effect(() => { text.disabled = locked.value; });

  effect(() => { text.classList.toggle("is-invalid", invalid.value); });

  effect(() => {
    const data = todos.value;
    const doneSet = done.value;
    const ol = document.createElement("ol");

    data.forEach((d, i) => {
      const li = document.createElement("li");
      li.className = "list-item d-flex align-items-center mb-1";

      const span = document.createElement("span");
      span.textContent = d; // textContent escapes HTML automatically — no XSS
      if (doneSet.has(i)) {
        span.style.textDecoration = "line-through";
        span.style.color = "#999";
      }
      li.appendChild(span);

      if (!doneSet.has(i)) {
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-success ms-2";
        btn.textContent = "Done";
        btn.addEventListener("click", () => app.onDone(i));
        li.appendChild(btn);
      }

      ol.appendChild(li);
    });

    table.replaceChildren(ol);
  });

  // ── page: same interface, methods now write to signals only ──────────────
  const page: Page = {
    textValue: () => text.value,
    resetText: () => { text.value = ""; },
    isValid: () => form.checkValidity(),

    setReady: (b) => { ready.value = b; },
    lockInput: (b) => { locked.value = b; },
    markInvalid: () => { invalid.value = true; },
    markValid: () => { invalid.value = false; },

    renderTable: (data, doneItems) => {
      batch(() => {
        todos.value = data;
        done.value = new Set(doneItems); // new ref so signal always fires
      });
    },
  };

  const client = new Client();
  const app = new App(page, client);

  text.addEventListener("input", () => app.onChange());
  text.addEventListener("invalid", (e: Event) => { e.preventDefault(); app.onInvalid(); });
  form.addEventListener("submit", (e: Event) => { e.preventDefault(); app.onSubmit(); });

  app.load();
});
