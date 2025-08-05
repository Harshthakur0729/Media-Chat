import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from "cors"
import config from "../src/config/config.js";
import userRoutes from "./Route/user.route.js"
import cookieParser from "cookie-parser";
import msgRoute from "../src/Route/message.rouet.js"
const app = express();
app.use(cors({ origin: config.ORIGIN, credentials: true }))
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());


app.use("/api", userRoutes,msgRoute )



export default app;
