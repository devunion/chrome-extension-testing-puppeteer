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

/* This parses a web page html document for all img elements and calcualtes the SHA 256
 * hash value of those elements' raw data. Then each image hash, the url of the web page
 * it was viewed on, and the time it was witnessed are sent to a backend via XLM POST request.
 *
 */

/* globals $, chrome */
const C = require('../chrome/assets/js/constants.js')
const U = require('../chrome/assets/js/utilities.js')

// Local Constant
var CL_MESSAGE_PASSING_OK = true // Assume okay in race condition with check

var monitoredImages = {} // jQuery object : timer object

/* Launched from bottom of this script file */

function main () {
  console.log('The Witness This Media Chrome Extension Copyright (C) 2020 Donald J. Patterson\n  This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you are welcome to redistribute it under certain conditions.  Contact the authors for details')

  U.checkMessagePassing(function (ok) {
    CL_MESSAGE_PASSING_OK = ok
  })

  if (C.C_DEBUG) {
    console.log('content.js main() finished')
  }
}

$(window).on('load', function () {
  if (C.C_DEBUG) {
    console.log('content.js script ran on load')
  }

  // Activate automatic witnessing as appropriate
  if (CL_MESSAGE_PASSING_OK) {
    chrome.runtime.sendMessage({ command: C.M_GET_AUTO_PROCESS }, function (response) {
      if (U.validateResponseOk(response)) {
        if (response.result === 'on') {
          collectImages()
        }
      }
    })
  }
})

function startMonitoringImage (theImage) {
  const theKey = theImage.src
  // Add image to monitoring dictionary with timer
  if ((typeof monitoredImages[theKey] === 'undefined') || !monitoredImages[theKey]) {
    // pick an interval between .5 seconds and 5 seconds
    // to avoid synchronization effects - heavy load etc.
    let theTime = Math.random() * 4500 + 500
    if (C.C_DEBUG) {
      theTime = 5000
    }

    var watch = function () {
      if (theImage.complete) {
        stopMonitoringImage(theKey)
        // Do something with loaded theImage
        if (C.C_DEBUG) {
          console.log('Witnessing ' + theImage.src)
        }
      }
    }
    var loadWatch = setInterval(watch, theTime)
    console.log('Starting monitoring ' + theKey + ':' + JSON.stringify(loadWatch))
    monitoredImages[theKey] = loadWatch
  } else {
    if (C.C_DEBUG) {
      console.log('monitoredImages already has that image:\n' + JSON.stringify(monitoredImages))
    }
  }
}

function stopMonitoringImage (theImageSrc) {
  const theKey = theImageSrc
  const theInterval = monitoredImages[theKey]
  console.log('Stopping monitoring ' + theKey + ':' + JSON.stringify(theInterval))
  if (!(typeof theInterval === 'undefined') && theInterval) {
    clearInterval(theInterval)
    monitoredImages[theKey] = null
  }
}

function stopMonitoringAllImages () {
  for (const key in monitoredImages) {
    if (Object.prototype.hasOwnProperty.call(monitoredImages, key)) {
      stopMonitoringImage(key)
    }
  }
}

/*
 * Finds all the images on the page and begins monitoring them for
 * return: Array of all non-empty image sources
 */
function collectImages () {
  // Set up for dynamic images
  $(document).on('load', 'img', startMonitoringImage)
  // Process current images in document
  $('img').each(function (index, value) {
    startMonitoringImage(value)
    return true // keep iterating
  })
}

// Wait for a manual initiation of the witnessing process
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    var wait = false

    if (C.C_DEBUG) {
      if (sender.tab) {
        console.log("Content script received command '" + request.command + "' from " + sender.tab.url)
      } else {
        console.log("Content script received command '" + request.command + "' from the extension")
      }
    }
    switch (request.command) {
      case C.M_MANUAL_WITNESS:
        collectImages()
        sendResponse({ result: C.MR_GOOD })
        break
      case C.M_STOP_WITNESS:
        stopMonitoringAllImages()
        sendResponse({ result: C.MR_GOOD })
        break
      default:
        sendResponse({ result: C.MR_UNKNOWN_COMMAND })
        break
    }
    if (C.C_DEBUG) {
      console.log("content.js processed command '" + request.command + '(' + request.data + ")'")
    }
    return wait
  }
)

// function leftovercode () {
//  // Dowload and hash images in srcList, then push their
//  // hash value to hashList
//  const hashList = []
//
//  for (let i = 0; i < srcList.length; i++) {
//    if (isUrl(srcList[i])) {
//      downloadImageFromUrl(srcList[i]).then(dowloadSuccess, console.error)
//    } else {
//      var srcHash = SHA256(srcList[i])
//      hashList.push(srcHash)
//      sendHashData(srcHash)
//    }
//  }
//  /* Wait 2 seconds for asyncrounous dowloads to finish and fully
//     * populate hashList before reporting data about the number of images
//     * that were witnessed
//     */
//
//  sleep(2000)
//
//  /* Hashes the data returned by a succesful image dowload.
//    * Called when a promise object from the 'downloadImageFromUrl' function
//    * is resolved asyncronously.
//    */
//  function dowloadSuccess (response) {
//    const srcHash = SHA256(response)
//    hashList.push(srcHash)
//    sendHashData(srcHash)
//  }
//
//  /* Helper function for sleep() that creates a promise object
//     */
//  function wait (ms) {
//    return new Promise(resolve => setTimeout(resolve, ms))
//  }
//
//  /* sleeps for time ms in miliseconds, then notifies the user of
//     * the amout of images that were successfuly dowloaded and hashed.
//     */
//  async function sleep (ms) {
//    await wait(ms)
//    if (C.C_DEBUG) {
//      console.log(hashList)
//    }
//    alert('You witnessed ' + hashList.length + ' images')
//  }
//
//  /* Send the hash value of an image, its webpage url, and date/time it was witness to a backend using
//     * an XML POST request.
//     * hashValue is a SHA256 hash value of an image's data
//     *
//     *     {
//     *        pageUrl : the url of the webpage the image was viewed at
//     *        imagehash : the SHA 256 hash value of the raw image data
//     *        When Witnessed : a stringified Date() object indicating when the image was witnessed
//     *     }
//     */
//  function sendHashData (hashValue) {
//    var xml = new XMLHttpRequest()
//    xml.open('POST', BACKEND_URL, true)
//    xml.setRequestHeader('Content-type', 'application/json;charset=UTF-8')
//    xml.onreadystatechange = function () {
//      if (xml.readyState == 4) {
//        if (C.C_DEBUG) {
//          // log the server's response to the console
//          console.log(JSON.parse(xml.response))
//        }
//      }
//    }
//    var time = new Date()
//    xml.send(JSON.stringify({ pageURL: pageURL, imageHash: hashValue, 'When Witnessed': time }))
//  }
// }
//
/// * Asynconously dowloads image data of any file type from an image URL
// * https://stackoverflow.com/questions/20035615/using-raw-image-data-from-ajax-request-for-data-uri/49467592
// * By icl7123
// */
// async function downloadImageFromUrl (url) { // returns dataURL
//  const xmlHTTP = new XMLHttpRequest()
//  xmlHTTP.open('GET', url, true)
//  xmlHTTP.responseType = 'blob'
//  const imageBlob = await new Promise((resolve, reject) => {
//    xmlHTTP.onload = e => xmlHTTP.status >= 200 && xmlHTTP.status < 300 && xmlHTTP.response.type.startsWith('image/') ? resolve(xmlHTTP.response) : reject(Error(`wrong status or type: ${xmlHTTP.status}/${xmlHTTP.response.type}`))
//    xmlHTTP.onerror = reject
//    xmlHTTP.send()
//  })
//  return blobToDataUrl(imageBlob)
// }
//
// function blobToDataUrl (blob) {
//  return new Promise(resolve => {
//    const reader = new FileReader() // https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
//    reader.onload = e => resolve(e.target.result)
//    reader.readAsDataURL(blob)
//  })
// }
//
/// * Returns true if the image source is a URL, false if it is image data
// */
// function isUrl (imgSrc) {
//  if (imgSrc.startsWith('http')) {
//    return true
//  } else {
//    return false
//  }
// }
//
/// *  Secure Hash Algorithm (SHA256)
// *  http://www.webtoolkit.info/
// *  Original code by Angel Marin, Paul Johnston.
// */
// function SHA256 (s) {
//  var chrsz = 8
//  var hexcase = 0
//
//  function safe_add (x, y) {
//    var lsw = (x & 0xFFFF) + (y & 0xFFFF)
//    var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
//    return (msw << 16) | (lsw & 0xFFFF)
//  }
//
//  function S (X, n) { return (X >>> n) | (X << (32 - n)) }
//
//  function R (X, n) { return (X >>> n) }
//
//  function Ch (x, y, z) { return ((x & y) ^ ((~x) & z)) }
//
//  function Maj (x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)) }
//
//  function Sigma0256 (x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)) }
//
//  function Sigma1256 (x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)) }
//
//  function Gamma0256 (x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)) }
//
//  function Gamma1256 (x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)) }
//
//  function core_sha256 (m, l) {
//    var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2)
//    var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19)
//    var W = new Array(64)
//    var a, b, c, d, e, f, g, h, i, j
//    var T1, T2
//    m[l >> 5] |= 0x80 << (24 - l % 32)
//    m[((l + 64 >> 9) << 4) + 15] = l
//
//    for (var i = 0; i < m.length; i += 16) {
//      a = HASH[0]
//      b = HASH[1]
//      c = HASH[2]
//      d = HASH[3]
//      e = HASH[4]
//      f = HASH[5]
//      g = HASH[6]
//      h = HASH[7]
//
//      for (var j = 0; j < 64; j++) {
//        if (j < 16) W[j] = m[j + i]
//        else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16])
//        T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j])
//        T2 = safe_add(Sigma0256(a), Maj(a, b, c))
//        h = g
//        g = f
//        f = e
//        e = safe_add(d, T1)
//        d = c
//        c = b
//        b = a
//        a = safe_add(T1, T2)
//      }
//      HASH[0] = safe_add(a, HASH[0])
//      HASH[1] = safe_add(b, HASH[1])
//      HASH[2] = safe_add(c, HASH[2])
//      HASH[3] = safe_add(d, HASH[3])
//      HASH[4] = safe_add(e, HASH[4])
//      HASH[5] = safe_add(f, HASH[5])
//      HASH[6] = safe_add(g, HASH[6])
//      HASH[7] = safe_add(h, HASH[7])
//    }
//    return HASH
//  }
//
//  function str2binb (str) {
//    var bin = Array()
//    var mask = (1 << chrsz) - 1
//    for (var i = 0; i < str.length * chrsz; i += chrsz) {
//      bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32)
//    }
//    return bin
//  }
//
//  function Utf8Encode (string) {
//    string = string.replace(/\r\n/g, '\n')
//    var utftext = ''
//    for (var n = 0; n < string.length; n++) {
//      var c = string.charCodeAt(n)
//      if (c < 128) {
//        utftext += String.fromCharCode(c)
//      } else if ((c > 127) && (c < 2048)) {
//        utftext += String.fromCharCode((c >> 6) | 192)
//        utftext += String.fromCharCode((c & 63) | 128)
//      } else {
//        utftext += String.fromCharCode((c >> 12) | 224)
//        utftext += String.fromCharCode(((c >> 6) & 63) | 128)
//        utftext += String.fromCharCode((c & 63) | 128)
//      }
//    }
//    return utftext
//  }
//
//  function binb2hex (binarray) {
//    var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'
//    var str = ''
//    for (var i = 0; i < binarray.length * 4; i++) {
//      str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
//            hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF)
//    }
//    return str
//  }
//
//  s = Utf8Encode(s)
//  return binb2hex(core_sha256(str2binb(s), s.length * chrsz))
// }

main()
