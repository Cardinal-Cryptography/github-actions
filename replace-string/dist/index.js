/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 272:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 347:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(272);
const github = __nccwpck_require__(347);
const fs = __nccwpck_require__(147)

try {
  const inString = core.getInput('string');
  const inReadFromFile = core.getInput('read-from-file');
  const inReadEncoding = core.getInput('read-encoding');
  const inReplaceRegex = core.getInput('replace-regex');
  const inReplaceWith = core.getInput('replace-with');
  const inWriteToFile = core.getInput('write-to-file');
  const inFlags = core.getInput('flags');


  // Validate inputs
  if (inReadFromFile != '' && !fs.existsSync(inReadFromFile)) {
  	throw new Error('File to read from does not exist');
  }
  if (inReadFromFile == '' && inString == '') {
  	throw new Error('There is nothing to replace');
  }
  if (inReplaceRegex == '') {
  	throw new Error('Regular expression cannot be empty')
  }

  const inReplaceRegexArr = inReplaceRegex.split(/\n/);
  const inReplaceWithArr = inReplaceWith.split(/\n/);

  // If replace-regex is multiline then replace-with should be multiline as well, with same number of lines.
  // Naturally in this scenario, a single replacement cannot be a multiline string.
  if (inReplaceRegexArr.length > 1) {
    if (inReplaceRegexArr.length != inReplaceWithArr.length) {
      throw new Error('When multiple regular expressions (multiline), replace-with should have exactly same number of lines');
    }
    for (i=0; i<inReplaceRegexArr.length; i++) {
      if (inReplaceRegexArr[i] == '') {
        throw new Error('Regular expression line cannot be empty');
      }
    }
  }

  // Action
  outReplacedString = '';
  outEncoding = (inReadEncoding != '' ? inReadEncoding : 'utf-8');
  if (inReadFromFile != '') {
  	outReplacedString = fs.readFileSync(inReadFromFile, outEncoding);
  } else {
  	outReplacedString = inString;
  }

  if (inReplaceRegexArr.length > 1) {
    for (i=0; i<inReplaceRegexArr.length; i++) {
      const regex = new RegExp(inReplaceRegexArr[i], inFlags);
      outReplacedString = outReplacedString.replace(regex, inReplaceWithArr[i]);
    }
  } else {
    console.log('Got replace regex of: '+inReplaceRegex)
    const regex = new RegExp(inReplaceRegex, inFlags);
    outReplacedString = outReplacedString.replace(regex, inReplaceWith);
  }

  // Output
  if (inWriteToFile != '') {
  	fs.writeFileSync(inWriteToFile, outReplacedString);
  }

  core.setOutput('replaced-string', outReplacedString);
} catch (error) {
  core.setFailed(error.message);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;