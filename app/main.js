import qricht from '../lib/qricht'

import * as offline from 'offline-plugin/runtime'

if (process.env.NODE_ENV !== 'development') {
  offline.install()
}

// get the template to generate stations
const $ = document.querySelectorAll.bind(document)
const CONTROLS = ['dS', 'dE', 'h', 'aLat', 'aLon', 'sName[]', 'sLat[]', 'sLon[]']
const TEMPLATE = $('#stationTemplate')[0].innerHTML
const $stationsContainer = $('#stationsContainer')[0]
const $outElement = $('#output')[0]
const $form = document.forms.form

let stations = 2

const addStationToDom = () => {
  const node = document.createElement('div')
  node.classList.add('row', 'mb-1')
  node.innerHTML = TEMPLATE
  $stationsContainer.appendChild(node)
}

const parseURLState = () => {
  let state = null
  try {
    if (window.location.hash.length > 1) {
      state = JSON.parse(window.atob(window.location.hash.substr(1)))
    }
  } catch (e) {
    $outElement.innerHTML = 'Error while parsing URL state'
  }
  return state
}

const parseForm = () => {
  let values = {}
  CONTROLS.forEach(c => {
    if (c.endsWith('[]')) {
      values[c] = []
      for (let i = 0; i < $form.elements[c].length; i++) {
        values[c].push($form.elements[c][i].value)
      }
    } else {
      values[c] = $form.elements[c].value
    }
  })
  return values
}

const onSubmit = (event) => {
  event && event.preventDefault()
  const form = parseForm()
  window.history.pushState(form, null, '#' + window.btoa(JSON.stringify(form)))
  computeValues(form)
}

const computeValues = (form) => {
  qricht(
    form.dS,
    form.dE,
    form.h,
    form.aLat,
    form.aLon,
    {
      name: form['sName[]'],
      lat: form['sLat[]'],
      lon: form['sLon[]']
    },
    $outElement
  )
}

// register event handlers
$('#addStationBtn')[0].addEventListener('click', addStationToDom)
$form.addEventListener('submit', onSubmit)
$stationsContainer.addEventListener('click', (event) => {
  if (event.target.getAttribute('title') === 'Delete') {
    if (window.confirm('Are you sure you want to delete this station ?')) {
      $stationsContainer.removeChild(event.target.closest('.row'))
    }
  }
})

function initForm (state) {
  // init page add the stations to the DOM
  if (!state) {
    state = parseURLState()
  }
  if (state && state['sName[]'].length > 2) {
    stations = state['sName[]'].length
  } else {
    stations = 2
  }

  // remove any existing stations
  const rows = $stationsContainer.querySelectorAll('.row')
  for (let i = 0; i < rows.length; i++) {
    $stationsContainer.removeChild(rows[i])
  }

  for (let i = 0; i < stations; i += 1) {
    addStationToDom()
  }
  // hydrate the form if we have some URL state
  if (state) {
    CONTROLS.forEach(c => {
      if (c.endsWith('[]')) {
        state[c].forEach((val, i) => { $form.elements[c][i].value = val })
      } else {
        $form.elements[c].value = state[c]
      }
    })
    computeValues(state)
  }
}

initForm()
window.onpopstate = (e) => initForm(e.state)
