import { TodoItem } from './client';

type DoneCallback = (id: number) => void;
type DeleteCallback = (ids: number[]) => void;

export class TodoList {
  private el: Element;
  private items: TodoItem[] = [];
  private selected: Set<number> = new Set();
  private onDoneCallback?: DoneCallback;
  private onDeleteCallback?: DeleteCallback;

  constructor(el: Element) {
    this.el = el;
  }

  onDone(cb: DoneCallback): void {
    this.onDoneCallback = cb;
  }

  onDelete(cb: DeleteCallback): void {
    this.onDeleteCallback = cb;
  }

  setItems(items: TodoItem[]): void {
    this.items = items;
    this.selected.clear();
    this.render();
  }

  private render(): void {
    const container = document.createElement('div');

    const ol = document.createElement('ol');
    ol.className = 'space-y-0';

    this.items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition duration-150 border-b border-gray-200 last:border-b-0';

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.selected.has(item.id);
      checkbox.className = 'mr-3 h-4 w-4 accent-blue-600 cursor-pointer flex-shrink-0';
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.selected.add(item.id);
        } else {
          this.selected.delete(item.id);
        }
        this.render();
      });
      li.appendChild(checkbox);

      // Title
      const textContainer = document.createElement('div');
      textContainer.className = 'flex-1';

      const span = document.createElement('span');
      if (item.done) {
        span.className = 'text-gray-400 text-sm';
        span.style.textDecoration = 'line-through';
      } else {
        span.className = 'text-gray-800 text-sm';
      }
      span.textContent = item.title;
      textContainer.appendChild(span);
      li.appendChild(textContainer);

      // Done button (undone items only)
      if (!item.done) {
        const btn = document.createElement('button');
        btn.className = 'ml-4 px-3 py-1 text-xs font-medium text-green-700 border border-green-600 rounded hover:bg-green-50 transition duration-150';
        btn.textContent = 'Done';
        btn.addEventListener('click', () => {
          this.onDoneCallback?.(item.id);
        });
        li.appendChild(btn);
      }

      ol.appendChild(li);
    });

    container.appendChild(ol);

    // Delete button
    const n = this.selected.size;
    const deleteBtn = document.createElement('button');
    deleteBtn.disabled = n === 0;
    deleteBtn.textContent = n > 0 ? `Delete (${n})` : 'Delete';
    deleteBtn.className = [
      'mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition duration-200',
      n > 0
        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
    ].join(' ');
    deleteBtn.addEventListener('click', () => {
      if (this.selected.size > 0) {
        this.onDeleteCallback?.([...this.selected]);
      }
    });
    container.appendChild(deleteBtn);

    this.el.replaceChildren(container);
  }
}
