let http = require("http");
let url = require("url");
let fs = require("fs");
let path = require("path");
const socketServer = require("./socket_server");

const ipLH = "localhost";
const ipHome = "10.0.0.2";
const ipHome2 = "10.0.0.6";
const ipShakury = "192.168.50.81";
const ipOfer = "";
const ipWork = "10.0.0.225";

// process.env.NODE_ENV = "development";
// process.env.NODE_ENV = "production";
process.env.NODE_ENV = "test";

function startServer(actions) {
  const server = http.createServer((req, res) => {
    //////////////////////////////////////////////////////////////////
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Origin", "http://" + ipWork + ":8080");
    const allowedOrigin =
      process.env.NODE_ENV === "test"
        ? "https://rishponpoker.netlify.app/"
        : "http://" + ipWork + ":8080";
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204); // No Content
      res.end();
      return;
    }
    //////////////////////////////////////////////////////////////////

    let q = url.parse(req.url, true);

    if (q.pathname.startsWith("/api")) {
      //dynamic content:
      let action = q.pathname.substring(4);

      if (!actions[action]) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("no such action.. ");
        return;
      }

      actions[action](req, res, q);
    } else {
      //static file:
      let allowedContentTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".png": "image/png",
        ".jpg": "image/jpg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".ogg": "audio/ogg",
        ".wav": "audio/wav",
        ".mp3": "audio/mp3",
      };

      // Construct the path to the file
      filename = null;
      if (q.pathname == "/") {
        filename = path.join(__dirname, "..", "client", "index.html");
      } else {
        filename = path.join(__dirname, "..", "client", q.pathname);
      }

      let indexOfDot = filename.lastIndexOf(".");
      if (indexOfDot == -1) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("bad file name **BAD-REQUEST**");
        return;
      }
      let extension = filename.substring(indexOfDot);
      let contentType = null;
      if (allowedContentTypes[extension]) {
        contentType = allowedContentTypes[extension];
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("bad extension **BAD-REQUEST**");
        return;
      }
      fs.readFile(filename, (err, data) => {
        if (err) {
          if (err.code == "ENOENT") {
            fs.readFile(
              path.join(__dirname, "../client", "404.html", (err, data) => {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end(content, "utf8");
                return;
              })
            );
          } else {
            res.writeHead(500);
            res.end("Sorry, there was a problem: " + error.code + " ..\n");
            return;
          }
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("file not found 404");
          return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      });
    }
  });
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log("Server is listening on port 8080");
  });
  socketServer.startServer(server);
}

exports.startServer = startServer;
