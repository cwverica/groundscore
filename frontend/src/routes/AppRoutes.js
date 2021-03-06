import React from "react";
import {
    Routes,
    Route
} from "react-router-dom";

import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';
import ProfileForm from '../profile/ProfileForm';
import ProtectedRoute from './ProtectedRoute';
import Homepage from '../homepage/Homepage';
import Search from '../search/Search';
import SavedSearches from '../saved/Saved';

// Skeleton of navigation for homepage
function AppRoutes({ login, signup }) {



    return (
        <div>
            <Routes>
                <Route exact path="/search" element={<Search />} />
                <Route exact path="/login" element={<LoginForm login={login} />} />
                <Route exact path="/signup" element={<SignupForm signup={signup} />} />
                <Route exact path="/mysearches" element={<SavedSearches />} />
                <Route exact path="/profile" element={<ProtectedRoute />} >
                    <Route exact path="/profile" element={<ProfileForm />} />
                </Route>
                <Route path="/" element={<Homepage />} />
            </Routes>
        </div>
    )
}

export default AppRoutes;