import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { TodoItem } from "./client";

@customElement("todo-list")
export class TodoList extends LitElement {
  override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  // ---- Properties passed down from todo-app -------------------------------

  @property({ attribute: false })
  items: TodoItem[] = [];

  @property({ attribute: false })
  selectedIds: number[] = [];

  // ---- Helpers ------------------------------------------------------------

  private isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  // ---- Event dispatchers --------------------------------------------------

  private onCheckboxChange(id: number, checked: boolean) {
    this.dispatchEvent(
      new CustomEvent<{ id: number; checked: boolean }>("selection-change", {
        bubbles: true,
        detail: { id, checked },
      })
    );
  }

  private onDoneClick(id: number) {
    this.dispatchEvent(
      new CustomEvent<{ id: number }>("todo-done", {
        bubbles: true,
        detail: { id },
      })
    );
  }

  // ---- Render -------------------------------------------------------------

  override render() {
    return html`
      <ol class="space-y-0">
        ${repeat(
      this.items,
      (item) => item.id,
      (item) => html`
            <li class="todo-item">
              <input
                type="checkbox"
                class="todo-checkbox"
                .checked=${this.isSelected(item.id)}
                @change=${(e: Event) =>
          this.onCheckboxChange(
            item.id,
            (e.target as HTMLInputElement).checked
          )}
              />

              <div class="flex-1">
                <span class=${item.done ? "todo-title--done" : "todo-title"}>
                  ${item.title}
                </span>
              </div>

              ${!item.done
          ? html`
                    <button
                      class="todo-done-btn"
                      @click=${() => this.onDoneClick(item.id)}
                    >
                      Done
                    </button>
                  `
          : null}
            </li>
          `
    )}
      </ol>
    `;
  }
}
