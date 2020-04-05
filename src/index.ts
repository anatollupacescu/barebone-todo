import init from './init'

function ready(callbackFunction) {
  if (document.readyState != 'loading')
    callbackFunction(event)
  else
    document.addEventListener("DOMContentLoaded", callbackFunction)
}

ready(init)