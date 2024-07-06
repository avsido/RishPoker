const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const socketServer = require("./socket_server");

function startServer(actions) {
  const server = http.createServer((req, res) => {
    const allowedOrigin =
      process.env.NODE_ENV === "test"
        ? "http://https://rishpoker.onrender.com"
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
      // Handle API requests
      let action = q.pathname.substring(4);

      if (!actions[action]) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("no such action.. ");
        return;
      }

      actions[action](req, res, q);
    } else {
      // Serve static files
      const allowedContentTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".ogg": "audio/ogg",
        ".wav": "audio/wav",
        ".mp3": "audio/mp3",
      };

      let filename = path.join(__dirname, "..", "client", q.pathname);

      // Check if the file exists
      fs.access(filename, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("file not found 404");
          return;
        }

        let extension = path.extname(filename);
        let contentType =
          allowedContentTypes[extension] || "application/octet-stream";

        fs.readFile(filename, (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("internal server error");
            return;
          }
          res.writeHead(200, { "Content-Type": contentType });
          res.end(data);
        });
      });
    }
  });

  const PORT = process.env.PORT || 8080;

  //for render.com purposes
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

  // server.listen(PORT, () => {
  //   console.log(`Server is listening on port ${PORT}`);
  // });

  socketServer.startServer(server);
}

exports.startServer = startServer;
