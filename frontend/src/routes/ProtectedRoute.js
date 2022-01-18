import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserContext from "../context/UserContext";

/** 
 * In routing component, use these instead of <Route>. 
 * 
 * will check if there is a valid current user. 
 * If no user is present, redirects to login.
 */

function ProtectedRoute({ exact, path, children }) {
    const { currentUser } = useContext(UserContext);

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return (
        <Outlet />
        // <Route exact={exact} path={path}>
        //     {children}
        // </Route>
    );
}

export default ProtectedRoute;
