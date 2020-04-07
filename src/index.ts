import init from './init'

function ready(callbackFn: EventListener) {
  if (document.readyState != 'loading')
    callbackFn(event)
  else
    document.addEventListener("DOMContentLoaded", callbackFn)
}

ready(init)