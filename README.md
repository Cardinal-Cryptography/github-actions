# github-actions

## Creating javascript actions
Please follow the official GitHub docs [here](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github)
and use `@vercel/ncc` to compile the action into one `dist/index.js` file.  Do not commmit `node_modules` directory as it contains loads of files.

### TL;DR 

* install vercel with `npm install -g @vercel/ncc`
* create `src/index.js` and `action.yml` files
* run `npm install`
* run `ncc build src/index.js`
* commit `src/index.js`, `dist/index.js` and `action.yml`
