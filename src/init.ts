import App, { Page } from "./app"
import Client from "./client"

export default function init() {
  let page: Page = {
    textValue: (): string => getTextValue(),
    resetText: (): void => resetText(),
    toggleInputEnabled: (b: boolean) => toggleInputEnabled(b),
    toggleAddBtnEnabled: (b: boolean) => toggleAddBtnEnabled(b),
    toggleError: (b: boolean): void => toggleError(b),
    renderTable: (data: string[]): void => renderTable(data)
  }

  let client = new Client()
  let app = new App(page, client)

  let form: HTMLFormElement = document.querySelector('#mainForm')
  form.onsubmit = (event: Event) => {
    event.preventDefault()
    app.onSubmit()
  }

  let e: HTMLInputElement = document.querySelector('#todoText')
  e.onkeyup = () => {
    app.onChange()
  }

  app.init()
}

function renderTable(data: string[]) {
  let result = data.map(d => `<li class="list-item">${d}</li>`).join('')
  document.querySelector('#table').innerHTML = `<ol>${result}</ol>`
}

function getTextValue(): string {
  let e: HTMLInputElement = document.querySelector('#todoText')
  return e.value
}

function resetText(): void {
  let e: HTMLInputElement = document.querySelector('#todoText')
  e.value = ''
}

function toggleError(b: boolean) {
  let e: HTMLInputElement = document.querySelector('#todoText')
  if (b) {
    e.classList.add('is-invalid');
    return
  }
  e.classList.remove('is-invalid');
}

function toggleInputEnabled(enabled: boolean) {
  let e: HTMLInputElement = document.querySelector('#todoText')
  e.disabled = !enabled
}

function toggleAddBtnEnabled(enabled: boolean) {
  let e: HTMLInputElement = document.querySelector('#addBtn')
  e.disabled = !enabled
}