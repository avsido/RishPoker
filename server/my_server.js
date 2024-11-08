/*
  overall standartd server as taught in school
*/

let http = require("http");
let url = require("url");
let fs = require("fs");
let path = require("path");
const socketServer = require("./socket_server");

// some utils for the render.com website:
// process.env.NODE_ENV = "development";
// process.env.NODE_ENV = "production";
process.env.NODE_ENV = "test";

function startServer(actions) {
  const server = http.createServer((req, res) => {
    // some CORS policy nuisance
    const allowedOrigin =
      process.env.NODE_ENV === "test"
        ? "https://https://rishpoker.onrender.com/"
        : "*";
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
      let filename = null;
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
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("file not found 404");
          return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      });
    }
  });

  // for render.com purpose:
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log("Server is listening on port 8080");
  });

  socketServer.startServer(server);
}

exports.startServer = startServer;
