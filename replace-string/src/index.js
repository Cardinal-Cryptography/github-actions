const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs')

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
  strToReplace = '';
  strEncoding = (inReadEncoding != '' ? inReadEncoding : 'utf-8');
  if (inReadFromFile != '') {
  	strToReplace = fs.readFileSync(inReadFromFile, strEncoding);
  } else {
  	strToReplace = inString;
  }

  if (inReplaceRegexArr.length > 1) {
    for (i=0; i<inReplaceRegexArr.length; i++) {
      const regex = new RegExp(inReplaceRegexArr[i], inFlags);
      strReplaced = strToReplace.replace(regex, inReplaceWithArr[i]);
    }
  } else {
    const regex = new RegExp(inReplaceRegex, inFlags);
    strReplaced = strToReplace.replace(regex, inReplaceWith);
  }

  // Output
  if (inWriteToFile != '') {
  	fs.writeFileSync(inWriteToFile, strReplaced);
  }

  core.setOutput('replaced-string', strReplaced);
} catch (error) {
  core.setFailed(error.message);
}
