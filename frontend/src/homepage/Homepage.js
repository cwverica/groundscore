import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../auth/UserContext";

import './Homepage.css';

function Homepage() {
    const { currentUser } = useContext(UserContext);

    return (
        <div className="Homepage">
            <div className="container text-center">
                <h1 className="font-weight-bold">
                    GroundScore
                </h1>
                <p className="lead">
                    What's it like when you're there?
                </p>
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
                            <Link
                                className="btn btn-primary font-weight-bold mr-3"
                                to="/login">
                                Log in
                            </Link>
                            <Link
                                className="btn btn-primary font-weight-bold"
                                to="/signup">
                                Sign up
                            </Link>
                        </p>
                    )}
                <Link
                    className="btn btn-primary font-weight-bold mr-3"
                    to="/search">
                    Let's search some neighborhoods!
                </Link>
            </div>
            <div className="container text-center">
                <div className="font-weight-bold">
                    What is&nbsp;
                    <u>
                        GroundScore?
                    </u>
                </div>
                <br />
                <br />
                GroundScore is an application to that helps people
                make a more informed decision about where their
                going to live.
                <br />
                Everyone can look at a map and see how close a house is
                to their favorite restaurant, the best museums, or the
                city park. Many maps will even tell you the terrain,
                public transit, commute times. There already exists plenty
                of platforms that can give you a home's value.
                <br />
                <hr />
                So what's missing?
                <br />
                <br />
                Safety.
                <br />
                <br />
                <br />
                No maps show you the relative safety of an area.
                <br />
                <br />
                Enter GroundScore. We use data aggregated from over 14000
                local law enforcement agencies to display the crime for the
                area surrounding a given address. This is one of the most
                crucial pieces of information to round out the picture of what
                life in a given area looks like, but is somehow ignored
                by most applications, companies, and people. That ends now.
                <br />
                <br />
                How safe is your neighborhood? Take GroundScore for a spin.
                Start off by clicking the compass in the upper right corner
                of the map. Then, look around to see how other areas of the
                country look...
                <br />
                <br />

                <Link
                    className="btn btn-primary font-weight-bold mr-3"
                    to="/search">
                    Give it a whirl...
                </Link>
            </div>
        </div >
    );
}

export default Homepage;