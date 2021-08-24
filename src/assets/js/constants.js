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

/* Constants used across all the extension javascript */

// XML POST requests sent to this url, this is a testing backend
const BACKEND_URL = 'https://reqres.in/api/users'

// Set to false to stop console output
const C_DEBUG = true
const C_VERSION = '0.0.3' // Should match manifest

// UI suffixes for input elements
const C_SLIDER = '_slider'
const C_BUTTON = '_button'
const C_TOOLTIP = '_tooltip'

// Keys used for persistent storage
const K_AUTO_WITNESS = 'auto_witness'
const K_MANUAL_WITNESS = 'manual_witness'

// Message passing commands
const M_VERSION = 'method_version'
const M_GET_AUTO_WITNESD = 'method_get_' + K_AUTO_WITNESS
const M_SET_AUTO_WITNESS = 'method_set_' + K_AUTO_WITNESS
const M_MANUAL_WITNESS = 'method_' + K_MANUAL_WITNESS
const M_STOP_WITNESS = 'method_stop_witnessing'

// Standard Message passing responses
const MR_WAIT = 'wait'
const MR_GOOD = 'good'
const MR_ERROR = 'error'
const MR_UNKNOWN_COMMAND = 'unknown command'

exports.BACKEND_URL = BACKEND_URL
exports.C_DEBUG = C_DEBUG
exports.C_VERSION = C_VERSION
exports.C_SLIDER = C_SLIDER
exports.C_BUTTON = C_BUTTON
exports.C_TOOLTIP = C_TOOLTIP
exports.K_AUTO_WITNESS = K_AUTO_WITNESS
exports.K_MANUAL_WITNESS = K_MANUAL_WITNESS
exports.M_VERSION = M_VERSION
exports.M_GET_AUTO_WITNESD = M_GET_AUTO_WITNESD
exports.M_SET_AUTO_WITNESS = M_SET_AUTO_WITNESS
exports.M_MANUAL_WITNESS = M_MANUAL_WITNESS
exports.M_STOP_WITNESS = M_STOP_WITNESS
exports.MR_WAIT = MR_WAIT
exports.MR_GOOD = MR_GOOD
exports.MR_ERROR = MR_ERROR
exports.MR_UNKNOWN_COMMAND = MR_UNKNOWN_COMMAND
