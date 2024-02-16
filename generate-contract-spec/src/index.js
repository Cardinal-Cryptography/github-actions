const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs')

try {
  const inSrcFiles = core.getInput('src-files');
  const inSrcString = core.getInput('src-string');
  const inDstFile = core.getInput('dst-file');
  const inSpecVersion = core.getInput('spec-version');
  const inContractVersion = core.getInput('contract-version');
  const inExclude = core.getInput('exclude');

  // Validate inputs
  if (inSrcFiles == '' && inSrcString == '') {
    throw new Error('No source provided');
  }

  if (inSpecVersion != '0.1') {
    throw new Error('Currently on spec version of 0.1 is supported');
  }

  if (inContractVersion == '') {
    throw new Error('Contract version cannot be empty');
  }

  let result = {
    version: inSpecVersion,
    contract_version: inContractVersion,
    addresses: {}
  }

  const inSrcFilesArr = inSrcFiles.split(/\n/);
  const inSrcStringArr = inSrcString.split(/\n/);
  const inExcludeArr = inExclude.split(/\n/);

  if (inSrcFilesArr.length > 0) {
    for (i = 0; i < inSrcFilesArr.length; i++) {
      if (inSrcFilesArr[i] == '')
        continue;

      const srcFileArr = inSrcFilesArr[i].split('|');
      if (srcFileArr[0] == '' || !fs.existsSync(srcFileArr[0])) {
        throw new Error('Invalid source file at index ' + i);
      }
      if (srcFileArr[1].match(/^[a-zA-Z0-9_-]{0,50}$/) == null) {
        throw new Error('Invalid contract prefix, should be ^[a-zA-Z0-9_-]{0,50}$');
      }

      let fileJSON = JSON.parse(fs.readFileSync(srcFileArr[0], { encoding: 'utf-8' }))
      for (const addr in fileJSON) {
        result.addresses[srcFileArr[1] + addr] = {
          contract: srcFileArr[1] + addr,
          address: fileJSON[addr]
        }
      }
    }
  }

  if (inSrcStringArr.length > 0) {
    for (i = 0; i < inSrcStringArr.length; i++) {
      if (inSrcStringArr[i] == '')
        continue;

      const srcStringArr = inSrcStringArr[i].split('|');
      if (srcStringArr[0].match(/^[a-zA-Z0-9_-]{1,50}$/) == null) {
        throw new Error('Invalid contract name, should be ^[a-zA-Z0-9_-]{1,50}$');
      }
      if (srcStringArr[1].match(/^[a-zA-Z0-9]{1,50}$/) == null) {
        throw new Error('Invalid address, should be ^[a-zA-Z0-9]{1,50}$');
      }

      result.addresses[srcStringArr[0]] = {
        contract: srcStringArr[0],
        address: srcStringArr[1]
      };
    }
  }

  if (inExcludeArr.length > 0) {
    for (i = 0; i < inExcludeArr.length; i++) {
      if (result.addresses.hasOwnProperty(inExcludeArr[i])) {
        delete result.addresses[inExcludeArr[i]];
      }
    }
  }

  let jsonString = JSON.stringify(result, null, "  ")

  if (inDstFile != '') {
    fs.writeFileSync(inDstFile, jsonString);
  }

  core.setOutput('json-minified', jsonString);

} catch (error) {
  core.setFailed(error.message);
}
