const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", __dirname + "/views");
app.use(express.static("public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("main.ejs");
});

app.post("/run", (req, res) => {
  console.log(req.body);
  res.render("display", { data: req.body });
});

let port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is running");
});
