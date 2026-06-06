import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import Client, { type TodoItem } from "./client";
import "./todo-list";

@customElement("todo-app")
export class TodoApp extends LitElement {
  override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  // ---- State --------------------------------------------------------------

  @state() private items: TodoItem[] = [];
  @state() private selectedIds: number[] = [];
  @state() private inputValue: string = "";
  @state() private inputInvalid: boolean = false;
  @state() private inputLocked: boolean = false;

  // ---- Client -------------------------------------------------------------

  private client = new Client();

  // ---- Lifecycle ----------------------------------------------------------

  override connectedCallback() {
    super.connectedCallback();
    this.load();
  }

  private async load() {
    try {
      this.items = await this.client.fetchAll();
    } catch (err) {
      console.error("could not fetch data", err);
    }
  }

  // ---- Form handlers ------------------------------------------------------

  private onInput(e: Event) {
    this.inputValue = (e.target as HTMLInputElement).value;
    // Only validate once the user has started typing
    if (this.inputInvalid) {
      this.validate();
    }
  }

  private validate(): boolean {
    const valid = this.inputValue.trim().length > 0;
    this.inputInvalid = !valid;
    return valid;
  }

  private async onSubmit(e: Event) {
    e.preventDefault();
    if (!this.validate()) return;

    this.inputLocked = true;
    try {
      this.items = await this.client.add(this.inputValue.trim());
      this.inputValue = "";
      this.inputInvalid = false;
      this.selectedIds = [];
    } catch (err) {
      console.error("could not add todo item", err);
    } finally {
      this.inputLocked = false;
    }
  }

  // ---- List event handlers ------------------------------------------------

  private onSelectionChange(e: Event) {
    const { id, checked } = (e as CustomEvent<{ id: number; checked: boolean }>).detail;
    if (checked) {
      if (!this.selectedIds.includes(id)) {
        this.selectedIds = [...this.selectedIds, id];
      }
    } else {
      this.selectedIds = this.selectedIds.filter((x) => x !== id);
    }
  }

  private async onDone(e: Event) {
    const { id } = (e as CustomEvent<{ id: number }>).detail;
    try {
      await this.client.markDone(id);
      this.items = await this.client.fetchAll();
      this.selectedIds = [];
    } catch (err) {
      console.error("could not mark item done", err);
    }
  }

  private async onDelete() {
    if (this.selectedIds.length === 0) return;
    try {
      await this.client.deleteItems(this.selectedIds);
      this.items = await this.client.fetchAll();
      this.selectedIds = [];
    } catch (err) {
      console.error("could not delete items", err);
    }
  }

  // ---- Render -------------------------------------------------------------

  override render() {
    const isValid = this.inputValue.trim().length > 0;
    const selectedCount = this.selectedIds.length;

    return html`
      <div class="min-h-screen flex items-center justify-center px-4 py-8 bg-linear-to-br from-gray-100 to-gray-200">
        <div class="w-full max-w-md">

          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Todo App</h1>
            <p class="text-gray-600">Organize your tasks efficiently</p>
          </div>

          <!-- Form Card -->
          <div class="bg-gray-50 rounded-lg shadow-md p-6 mb-6 border border-gray-300">
            <form role="form" id="mainForm" novalidate @submit=${this.onSubmit}>
              <div class="mb-4">
                <label for="todoText" class="block text-sm font-medium text-gray-700 mb-2">
                  Add a new task
                </label>
                <input
                  type="text"
                  id="todoText"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                         ${this.inputInvalid ? "border-red-500" : "border-gray-300"}"
                  autocomplete="off"
                  placeholder="Enter your task..."
                  .value=${this.inputValue}
                  ?disabled=${this.inputLocked}
                  @input=${this.onInput}
                />
                <div class="text-sm text-red-600 mt-1 error-message ${this.inputInvalid ? "" : "hidden"}">
                  Please enter a task
                </div>
              </div>
              <button
                type="submit"
                id="addBtn"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                ?disabled=${!isValid || this.inputLocked}
              >
                Add Task
              </button>
            </form>
          </div>

          <!-- Tasks List -->
          <div class="bg-gray-50 rounded-lg shadow-md p-6 border border-gray-300">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Your Tasks</h2>

            <todo-list
              id="table"
              .items=${this.items}
              .selectedIds=${this.selectedIds}
              @selection-change=${this.onSelectionChange}
              @todo-done=${this.onDone}
            ></todo-list>

            <button
              id="deleteBtn"
              class="delete-btn ${selectedCount > 0 ? "delete-btn--active" : "delete-btn--inactive"}"
              ?disabled=${selectedCount === 0}
              @click=${this.onDelete}
            >
              ${selectedCount > 0 ? `Delete (${selectedCount})` : "Delete"}
            </button>
          </div>

        </div>
      </div>
    `;
  }
}
