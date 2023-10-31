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
  invalidValues = [];
  for (i=0; i<inNamesArr.length; i++) {
    const inputValue = core.getInput(inNamesArr[i]);
    const regex = new RegExp(inRegexpsArr[i], 'g')
    if (!inputValue.match(regex)) {
      invalidValues.push(inNamesArr[i]);
    }
  }

  if (invalidValues.length > 0) {
    throw new Error('The following inputs have invalid values: ' + invalidValues.join(','))
  }
} catch (error) {
  core.setFailed(error.message);
}
