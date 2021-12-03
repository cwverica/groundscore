import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import UserContext from "../auth/UserContext";
import './Navbar.css';

/**  Navigation bar that shows up on every page.
 * 
 *  Rendered by App.js so it's highest possible level.
*/

function Navbar({ logout }) {
    const { currentUser } = useContext(UserContext);

    function loggedInNav() {
        return (
            <Dropdown drop="start">
                <Dropdown.Toggle variant="info" id="dropdown-basic">
                    Your Stuff
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item href="#/mysearches">Saved Searches</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="/profile">View Profile</Dropdown.Item>
                    <Dropdown.Item href="#/profile/edit">Edit Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/logout">Logout</Dropdown.Item>

                </Dropdown.Menu>
            </Dropdown>
        );
    }

    function loggedOutNav() {
        return (
            <Dropdown drop="start">
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    Register
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item href="/login">Login</Dropdown.Item>
                    <Dropdown.Item href="/signup">Signup</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    return (
        <nav className="Navigation navbar navbar-expand-md">
            <Link className="navbar-brand" to="/">
                GroundScore
            </Link>

            <div className="user-button">
                {currentUser ? loggedInNav() : loggedOutNav()}
            </div>
        </nav>
    );
}

export default Navbar;