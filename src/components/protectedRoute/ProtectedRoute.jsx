import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {


    if (!token) {
        return <Navigate to="/register" replace />;
    }

    return children;
};

export default ProtectedRoute;