try {
  console.log('Hello');

} catch (error) {
  core.setFailed(error.message);
}
