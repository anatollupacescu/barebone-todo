import { signal, computed, effect } from '@preact/signals-core';
import { TodoItem } from './client';

type DoneCallback   = (id: number)    => void;
type DeleteCallback = (ids: number[]) => void;

export class TodoList {
  private el:        HTMLElement;
  private deleteBtn: HTMLButtonElement;

  private items    = signal<TodoItem[]>([]);
  private selected = signal<Set<number>>(new Set());

  private selectedCount = computed(() => this.selected.value.size);
  private deleteLabel   = computed(() =>
    this.selectedCount.value > 0
      ? `Delete (${this.selectedCount.value})`
      : 'Delete'
  );

  private onDoneCallback?:   DoneCallback;
  private onDeleteCallback?: DeleteCallback;

  constructor(el: HTMLElement, deleteBtn: HTMLButtonElement) {
    this.el        = el;
    this.deleteBtn = deleteBtn;

    this.deleteBtn.addEventListener('click', () => {
      if (this.selected.value.size > 0) {
        this.onDeleteCallback?.([...this.selected.value]);
      }
    });

    effect(() => {
      const n = this.selectedCount.value;
      this.deleteBtn.textContent = this.deleteLabel.value;
      this.deleteBtn.disabled    = n === 0;
      this.deleteBtn.className   = [
        'delete-btn',
        n > 0 ? 'delete-btn--active' : 'delete-btn--inactive',
      ].join(' ');
    });

    effect(() => {
      this.renderList(this.items.value, this.selected.value);
    });
  }

  onDone(cb: DoneCallback):     void { this.onDoneCallback   = cb; }
  onDelete(cb: DeleteCallback): void { this.onDeleteCallback = cb; }

  setItems(items: TodoItem[]): void {
    this.items.value    = items;
    this.selected.value = new Set();
  }

  private renderList(items: TodoItem[], selected: Set<number>): void {
    const ol = document.createElement('ol');
    ol.className = 'space-y-0';

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'todo-item';

      const checkbox     = document.createElement('input');
      checkbox.type      = 'checkbox';
      checkbox.checked   = selected.has(item.id);
      checkbox.className = 'todo-checkbox';
      checkbox.addEventListener('change', () => {
        const next = new Set(this.selected.value);
        checkbox.checked ? next.add(item.id) : next.delete(item.id);
        this.selected.value = next;
      });
      li.appendChild(checkbox);

      const textContainer     = document.createElement('div');
      textContainer.className = 'flex-1';

      const span       = document.createElement('span');
      span.className   = item.done ? 'todo-title--done' : 'todo-title';
      span.textContent = item.title;
      textContainer.appendChild(span);
      li.appendChild(textContainer);

      if (!item.done) {
        const btn       = document.createElement('button');
        btn.className   = 'todo-done-btn';
        btn.textContent = 'Done';
        btn.addEventListener('click', () => this.onDoneCallback?.(item.id));
        li.appendChild(btn);
      }

      ol.appendChild(li);
    });

    this.el.replaceChildren(ol);
  }
}