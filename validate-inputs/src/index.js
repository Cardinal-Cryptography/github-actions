try {
  console.log(process.env['GITHUB_ACTION']);

} catch (error) {
  core.setFailed(error.message);
}
