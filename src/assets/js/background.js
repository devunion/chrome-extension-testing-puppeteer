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

/* globals chrome */
const C = require('../chrome/assets/js/constants.js')

if (C.C_DEBUG) {
  console.log('Background script launched')
}

/**
 * Upate the extension browser icon to reflect the value passed in
 * value in ('on','off')
 * percent in [0,100]
 */
function updateBrowserIcon (value, percent) {
  if (Object.prototype.hasOwnProperty.call(chrome, 'browserAction')) {
    // alert("update browser icon "+JSON.stringify(value)+" "+JSON.stringify(percent))
    if ((value === 'off') || (value === 'on')) {
      if (!(typeof percent === 'number')) {
        percent = 0
      }
      if (percent <= 0 || percent >= 100) {
        chrome.browserAction.setIcon({
          path: {
            16: 'assets/img/16x16_auto_' + value + '.png',
            19: 'assets/img/19x19_auto_' + value + '.png',
            32: 'assets/img/32x32_auto_' + value + '.png',
            48: 'assets/img/48x48_auto_' + value + '.png',
            64: 'assets/img/64x64_auto_' + value + '.png',
            128: 'assets/img/128x128_auto_' + value + '.png'
          }
        })
      } else {
        // chunk into fives
        percent = Math.round(Math.ceil(percent / 5) * 5)
        var suffix = (percent + '').padStart(3, 0)
        chrome.browserAction.setIcon({
          path: {
            // "16": "assets/img/16x16_auto_"+value+"_"+suffix+".png",
            19: 'assets/img/19x19_auto_' + value + '_' + suffix + '.png'
            // "32": "assets/img/32x32_auto_"+value+"_"+suffix+".png",
            // "48": "assets/img/48x48_auto_"+value+"_"+suffix+".png",
            // "64": "assets/img/64x64_auto_"+value+"_"+suffix+".png",
            // "128": "assets/img/128x128_auto_"+value+"_"+suffix+".png"
          }
        })
      }
    } else {
      chrome.browserAction.setIcon({
        path: {
          16: 'assets/img/16x16.png',
          19: 'assets/img/19x19.png',
          32: 'assets/img/32x32.png',
          48: 'assets/img/48x48.png',
          64: 'assets/img/64x64.png',
          128: 'assets/img/128x128.png'
        }
      })
    }
  }
}

// Update the browser icon on start
chrome.storage.local.get([C.K_AUTO_WITNESS], function (result) {
  let value = result[C.K_AUTO_WITNESS]
  if ((typeof value === 'undefined') || !value) {
    value = 'off'
  }
  updateBrowserIcon(value)
})

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    var wait = false

    if (C.C_DEBUG) {
      if (sender.tab) {
        console.log("Background script received command '" + request.command + "' from " + sender.tab.url)
      } else {
        console.log("Background script received command '" + request.command + "' from the extension")
      }
    }

    switch (request.command) {
      case C.M_VERSION:
        sendResponse({ result: C.C_VERSION })
        break
      case C.M_GET_AUTO_PROCESS:
        wait = true
        chrome.storage.local.get({ [C.K_AUTO_WITNESS]: 'off' }, function (result) {
          const value = result[C.K_AUTO_WITNESS]
          sendResponse({ result: value })
        })
        break
      case C.M_SET_AUTO_PROCESS:
        wait = true
        var newValue = request.data
        chrome.storage.local.set({ [C.K_AUTO_WITNESS]: newValue }, function () {
          if (chrome.runtime.lastError) {
            console.error('Error setting ' + C.K_AUTO_WITNESS + ' to ' + JSON.stringify(newValue) + ': ' + chrome.runtime.lastError.message)
            sendResponse({ result: C.MR_ERROR })
          } else {
            updateBrowserIcon(newValue)
            sendResponse({ result: C.MR_GOOD })
          }
        })
        break
      default:
        sendResponse({ result: C.MR_UNKNOWN_COMMAND })
        break
    }
    if (C.C_DEBUG) {
      console.log("Processed command '" + request.command + '(' + request.data + ")'")
    }
    return wait
  }
)
