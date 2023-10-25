try {
  console.log(process.env);

} catch (error) {
  core.setFailed(error.message);
}
