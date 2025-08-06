import app from "./src/index.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import http from "http";
import initSocket from "./src/utils/socket.io.js";

const PORT = process.env.PORT || config.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

connectDB()
    .then(() => {
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    });
