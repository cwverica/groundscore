import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../auth/UserContext";

import './Homepage.css';

function Homepage() {
    const { currentUser } = useContext(UserContext);

    return (
        <div className="Homepage">
            <div className="container text-center">
                <h1 className="mb-4 font-weight-bold">GroundScore</h1>
                <p className="lead">What's it like when you're there?</p>
                {currentUser
                    ? (
                        <div className="greetings">
                            <h2>
                                Welcome Back, {currentUser.firstName || currentUser.username}!
                            </h2>
                            <br />
                        </div>
                    )
                    : (
                        <p>
                            <Link className="btn btn-primary font-weight-bold mr-3"
                                to="/login">
                                Log in
                            </Link>
                            <Link className="btn btn-primary font-weight-bold"
                                to="/signup">
                                Sign up
                            </Link>
                        </p>
                    )}
                <a className="button" href="/search">Let's search some neighborhoods!</a>
            </div>
        </div >
    );
}

export default Homepage;