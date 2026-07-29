import "dotenv/config";
import app from "./app.js";
import http from "http";
import serverless from "serverless-http"; 

const PORT = process.env.PORT || 5000;


if (process.env.NODE_ENV !== "production") {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log("Server is listening on PORT:", PORT);
  });
}


export default serverless(app);