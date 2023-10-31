const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs')

try {
  const inValues = core.getInput('values');
  const inRegexps = core.getInput('regexps');

  const inValuesArr = inValues.split(/\n/);
  const inRegexpsArr = inRegexps.split(/\n/);

  if (inValuesArr.length == 0) {
    throw new Error('Values cannot be empty')
  }

  if (inValuesArr.length != inRegexpsArr.length) {
    throw new Error('Number of values must match number of regular expressions');
  }
  for (i=0; i<inRegexpsArr.length; i++) {
    if (inRegexpsArr[i] == '') {
      throw new Error('Regular expression line cannot be empty');
    }
  }

  // Action
  invalidValues = [];
  for (i=0; i<inValuesArr.length; i++) {
    const regex = new RegExp(inRegexpsArr[i], '')
    if (!regex.test(inValuesArr[i])) {
      console.log('Value '+i+' does not match regular expression of '+inRegexpsArr[i])
      invalidValues.push(i);
    }
  }

  if (invalidValues.length > 0) {
    throw new Error('The following values do not match regular expressions: ' + invalidValues.join(','))
  }
} catch (error) {
  core.setFailed(error.message);
}
