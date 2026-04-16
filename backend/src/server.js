const { app, start } = require("./app");
const PORT = Number(process.env.PORT || 3000);

start()
  .then(() => app.listen(PORT, () => console.log(`Backend running on ${PORT}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
