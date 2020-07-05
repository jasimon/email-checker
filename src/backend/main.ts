import * as express from "express";
import * as path from "path";
// import bodyParser from "body-parser";

var app = express();

app.use(express.json());
let profileObj;

// Simple endpoint that returns the current time
app.get("/api/time", function (req, res) {
  res.send(new Date().toISOString());
});

app.post("/api/auth", function (req, res) {
  // just store in memory for now
  profileObj = req.body.profileObj;
  // eventually this will be some sort of user model
  res.send(profileObj);
});

// Serve static files
app.use("/", express.static(path.join(__dirname, "/www")));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
