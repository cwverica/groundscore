import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../context/UserContext";
import stareAtMap from "../static/images/cute/stare_at_map.png";

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
                                className="btn btn-success font-weight-bold mr-3"
                                to="/login">
                                Log in
                            </Link>
                            <Link
                                className="btn btn-success font-weight-bold"
                                to="/signup">
                                Sign up
                            </Link>
                        </p>
                    )}
                <img className="homepage-detective-image" src={stareAtMap} />
            </div>
            <div className="container">
                <h3 className="font-weight-bold">
                    What is GroundScore?
                </h3>
                <div className="container text-left">
                    GroundScore is an application to that helps people
                    make a more informed decision about where they're
                    going to live.
                    <br />
                    <br />
                    Groundscore connects you directly to the crime statistics
                    of a given area. Using data aggregated from over 14000 local
                    law enforcement agencies. Knowing the trends in local crime
                    and safety is crucial in deciding where you want to call home;
                    let GroundScore give you the data for your peace of mind.
                    <br />
                    <hr />
                    <br />
                    <br />
                    How safe is your neighborhood? Take GroundScore for a spin.
                    Start off by clicking the compass in the upper right corner
                    of the map to search around your current neighborhood. Then,
                    look around to see how other areas of the country look...
                    <br />
                    <br />
                </div>

                <Link
                    className="btn btn-primary font-weight-bold mr-3"
                    to="/search">
                    Try it out now
                </Link>
            </div>
        </div >
    );
}

export default Homepage;