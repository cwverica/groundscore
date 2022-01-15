import React, {
    useState
} from "react";
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

    const [selected, setSelected] = useState(null);

    return (
        <div>
            <Routes>
                <Route exact path="/search" element={<Search selected={selected} setSelected={setSelected} />} />
                <Route exact path="/login" element={<LoginForm login={login} />} />
                <Route exact path="/signup" element={<SignupForm signup={signup} />} />
                <Route exact path="/mysearches" element={<SavedSearches setSelected={setSelected} />} />
                <Route exact path="/profile" element={<ProtectedRoute />} >
                    <Route exact path="/profile" element={<ProfileForm />} />
                </Route>
                <Route path="/" element={<Homepage />} />
                {/* <Navigate to="/" />    Figure out reactV6 way of catchall/redirect */}
            </Routes>
        </div>
    )
}

export default AppRoutes;