const express = require("express");
const {router} = require("./routes/routes.js");

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Go to /api/v1/ </h1>");
});

app.get("/api/v1", (req, res) => {
  res.send("<h1>Hello brother</h1>");
});

app.use("/api/v1", router);

app.listen(PORT, console.log(`Server is Listening on port ${PORT}`));
