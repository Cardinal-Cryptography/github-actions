const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs')

try {
  const inNames = core.getInput('names');
  const inRegexps = core.getInput('regexps');

  const inNamesArr = inNames.split(/\n/);
  const inRegexpsArr = inRegexps.split(/\n/);

  if (inNamesArr.length == 0) {
    throw new Error('Names cannot be empty')
  }

  if (inNamesArr.length != inRegexpsArr.length) {
    throw new Error('Number of names must match number of regular expressions');
  }
  for (i=0; i<inRegexpsArr.length; i++) {
    if (inRegexpsArr[i] == '') {
      throw new Error('Regular expression line cannot be empty');
    }
  }

  // Action
  invalidNames = [];
  for (i=0; i<inNamesArr.length; i++) {
    const inputValue = core.getInput(inNamesArr[i]);
    const regex = new RegExp(inRegexpsArr[i], '')
    if (!regex.test(inputValue)) {
      console.log('Input '+inNamesArr[i]+' value '+inputValue+' does not match regular expression of '+inRegexpsArr[i])
      invalidNames.push(inNamesArr[i]);
    }
  }

  if (invalidNames.length > 0) {
    throw new Error('The following inputs have invalid values: ' + invalidNames.join(','))
  }
} catch (error) {
  core.setFailed(error.message);
}
