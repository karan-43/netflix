import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {

    useEffect(() => {

    }, []);

    if (!token) {
        return
    }

    return children;
};

export default ProtectedRoute;