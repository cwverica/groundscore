import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';
import ProfileForm from '../profile/ProfileForm';
import ProtectedRoute from './ProtectedRoute';
import Homepage from '../homepage/Homepage';
import Map from '../map/Map';

// Skeleton of navigation for homepage
function AppRoutes({ login, signup }) {

    return (
        <div>
            <Routes>
                <Route exact path="/" element={<Homepage />} />
                <Route exact path="/search" element={<Map />} />
                <Route exact path="/login" element={<LoginForm login={login} />} />
                <Route exact path="/signup" element={<SignupForm signup={signup} />} />
                <Route exact path="/profile" element={<ProtectedRoute />} >
                    <Route exact path="/profile" element={<ProfileForm />} />
                </Route>
                {/* <Navigate to="/" />    Figure out reactV6 way of catchall/redirect */}
            </Routes>
        </div>
    )
}

export default AppRoutes;