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

    this.items.forEach((item, i) => {
      const li = document.createElement("li");
      li.className = "list-item d-flex align-items-center mb-1";

      const span = document.createElement("span");
      span.textContent = item;
      if (this.done.has(i)) {
        span.style.textDecoration = "line-through";
        span.style.color = "#999";
      }
      li.appendChild(span);

      if (!this.done.has(i)) {
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-outline-success ms-2";
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