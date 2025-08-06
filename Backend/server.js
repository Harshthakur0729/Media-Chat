import app from "./src/index.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import http from "http";
import initSocket from "./src/utils/socket.io.js";



const server = http.createServer(app);

initSocket(server);

server.listen(config.PORT, "0.0.0.0", () => {
    connectDB();
    console.log(`server is running http://localhost:${config.PORT}`);
});
