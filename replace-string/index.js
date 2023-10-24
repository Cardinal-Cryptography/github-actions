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


  // Action
  strToReplace = '';
  strEncoding = (inReadEncoding != '' ? inReadEncoding : 'utf-8');
  if (inReadFromFile != '') {
  	strToReplace = fs.readFileSync(inReadFromFile, strEncoding);
  } else {
  	strToReplace = inString;
  }

  const regex = new RegExp(inReplaceRegex, inFlags);
  strReplaced = string.replace(regex, inReplaceWith);


  // Output
  if (inWriteToFile != '') {
  	fs.writeFileSync(inWriteToFile, strReplaced);
  }

  core.setOutput('replaced-string');
} catch (error) {
  core.setFailed(error.message);
}
