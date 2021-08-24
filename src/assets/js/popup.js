/*
 * Copyright 2020 Don Patterson, github: @djp3 email: d_j_p_3 at djp3.net
 *
 *  This file is part of the Witness This Media Chrome Extension (WTMCE).

    WTMCE is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WTMCE is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WTMCE.  If not, see <https://www.gnu.org/licenses/>.

*/

/* Begins witnessing proccess by clicking extention icon and then clicking the button that appears
 * Created by Ben Thomas
 * significantly influenced by: https://www.youtube.com/watch?v=Ipa58NVGs_c
 */

/* globals $, chrome */
const C = require('../chrome/assets/js/constants.js')
const U = require('../chrome/assets/js/utilities.js')

// Local Constant
var CL_MESSAGE_PASSING_OK = true // Assume it is working in race conditions with the check

function main () {
  U.checkMessagePassing(function (ok) {
    CL_MESSAGE_PASSING_OK = ok
  })

  if (C.C_DEBUG) {
    console.log('popup.js main() finished')
  }
}

function updateKAUTOWITNESS (value) {
  // Resolve what the new setting should be between the parameter and the U/I.
  // The incoming parameter has priority
  // Default is off
  var newValue = 'off' // default
  if ($('#' + C.K_AUTO_WITNESS).prop('checked')) {
    newValue = 'on'
  }

  // If we have an input parameter and understand it,  then use it
  if (typeof value !== 'undefined' && value) {
    if (value === 'on') {
      newValue = 'on'
    } else if (value === 'off') {
      newValue = 'off'
    }
  }

  // Store the value in local storage for persistence
  if (CL_MESSAGE_PASSING_OK) {
    chrome.runtime.sendMessage({ command: C.M_SET_AUTO_WITNESS, data: newValue }, function (response) {
      if (!U.validateResponseOK(response)) {
        if (C.C_DEBUG) {
          console.log('Storage failed for newValue:' + newValue + ':' + JSON.stringify(response))
        }
      }
      // Nothing to do if everything goes right
    })
  }

  // If the newValue is on, then make sure it starts a witness process
  if (newValue === 'on') {
    manualWitnessStart()
  } else if (newValue === 'off') {
    manualWitnessStop()
  }

  return newValue
}

function manualWitnessStart () {
  chrome.tabs.query({ active: true, currentWindow: true },
    function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { command: C.M_MANUAL_WITNESS },
        function (response) {
          if (C.C_DEBUG) {
            console.log('manual witness start result:' + response.result)
          }
        }
      )
    }
  )
}

function manualWitnessStop () {
  chrome.tabs.query({ active: true, currentWindow: true },
    function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { command: C.M_STOP_WITNESS },
        function (response) {
          if (C.C_DEBUG) {
            console.log('manual witness stop result:' + response.result)
          }
        }
      )
    }
  )
}

$(window).on('load', function () {
  // Attach action to manual button
  $('#manual_process_button').click(manualWitnessStart)

  // Build slider for K_AUTO_WITNESS
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).attr('data-toggle', 'toggle')
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).attr('data-onstyle', 'success')
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).attr('data-on', '<i class="far fa-eye fa-lg"></i>')
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).attr('data-off', '<i class="far fa-eye-slash fa-lg"></i>')
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).attr('data-offstyle', 'outline-danger')
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).bootstrapToggle('disable')
  // Initialize it to the stored value
  if (CL_MESSAGE_PASSING_OK) {
    console.log('About to initialize slider')
    chrome.runtime.sendMessage({ command: C.M_GET_AUTO_WITNESS }, function (response) {
      console.log('Got a call back:' + JSON.stringify(response))
      if (U.validateResponseOK(response)) {
        var newValue = response.result
        console.log("Got a call back that's ready: " + newValue)
        $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).bootstrapToggle('enable', false)
        $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).bootstrapToggle(newValue, false)
        // Register for new changes
        $('#' + C.K_AUTO_WITNESS + C.C_SLIDER).change(updateKAUTOWITNESS)
      }
    })
  } else {
    console.log('Message passing not okay')
  }

  // Tooltips
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER + C.C_TOOLTIP).attr('title', chrome.i18n.getMessage('ext_auto_tooltip'))
  $('#' + C.K_AUTO_WITNESS + C.C_SLIDER + C.C_TOOLTIP).tooltip()

  $('#' + C.K_MANUAL_WITNESS_C_BUTTON_C.C_TOOLTIP).attr('title', chrome.i18n.getMessage('ext_manual_tooltip'))
  $('#' + C.K_MANUAL_WITNESS_C_BUTTON_C.C_TOOLTIP).tooltip()

  if (C.C_DEBUG) {
    console.log('popup.js script ran on load')
  }
})

main()
