import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const Auth = ({ children }) => {
    const token = Cookies.get("token");

    if (!token) {
        // if user is not login they navigate to /login route 
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default Auth;
