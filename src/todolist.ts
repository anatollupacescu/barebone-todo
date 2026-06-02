type DoneCallback = (index: number) => void;

export class TodoList {
  private el: Element;
  private items: string[] = [];
  private done: Set<number> = new Set();
  private selected: Set<number> = new Set();
  private onDoneCallback?: DoneCallback;

  constructor(el: Element) {
    this.el = el;
  }

  onDone(cb: DoneCallback): void {
    this.onDoneCallback = cb;
  }

  setItems(items: string[]): void {
    this.items = items;
    this.render();
  }

  private render(): void {
    const ol = document.createElement("ol");
    ol.className = "space-y-0";

    this.items.forEach((item, i) => {
      const li = document.createElement("li");
      li.className = "flex items-start justify-between px-4 py-3 hover:bg-gray-100 transition duration-150 border-b border-gray-200 last:border-b-0 cursor-pointer";

      const textContainer = document.createElement("div");
      textContainer.className = "flex-1";

      const span = document.createElement("span");
      span.className = "text-gray-800 text-sm";
      span.textContent = item;
      if (this.done.has(i)) {
        span.style.textDecoration = "line-through";
        span.className = "text-gray-400 text-sm";
      }
      textContainer.appendChild(span);
      li.appendChild(textContainer);

      if (!this.done.has(i)) {
        const btn = document.createElement("button");
        btn.className = "ml-4 px-3 py-1 text-xs font-medium text-green-700 border border-green-600 rounded hover:bg-green-50 transition duration-150";
        btn.textContent = "Done";
        btn.addEventListener("click", () => {
          this.done.add(i);
          this.render();              // immediate visual feedback
          this.onDoneCallback?.(i);  // notify App to refresh data
        });
        li.appendChild(btn);
      }

      ol.appendChild(li);
    });

    this.el.replaceChildren(ol);
  }
}