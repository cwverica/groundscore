import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import UserContext from "../context/UserContext";
import './Navbar.css';

/**  Navigation bar that shows up on every page.
 * 
 *  Rendered by App.js so it's highest possible level.
*/

function Navbar({ logout }) {
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);

    function handleLogout() {
        logout();
        navigate("/");
    }

    function loggedInNav() {
        return (
            <Dropdown drop="start">
                <Dropdown.Toggle variant="info" id="dropdown-basic">
                    Your Stuff
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item href="/mysearches">Saved Searches</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="/profile">View Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>

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

            <Link
                className="btn btn-primary font-weight-bold mr-3"
                to='/search'>
                To Search Page
            </Link>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div className="user-button">
                {currentUser ? loggedInNav() : loggedOutNav()}
            </div>
        </nav>
    );
}

export default Navbar;