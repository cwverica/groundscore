import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import SearchContext from "../context/SearchContext";
import UserContext from "../context/UserContext";

function SavedSearches() {

    const { setSelected, setSearch, setStatus } = useContext(SearchContext);
    const { searches } = useContext(UserContext);

    const testLoc = {
        id: "temp",
        closestOri: "DE0020200",
        lat: 39.4302853,
        lng: -75.6486525,
        state: "DE",
        city: "Townsend",
        county: "New Castle",
        title: "Thisisthetest"
    };


    // const testSearch = {
    //     pathname: "/search",
    //     state: {
    //         selected: testLoc
    //     }
    // };

    function handleGoTo(location) {
        setSelected(location)
        setSearch(location)
        setStatus("loading")
    }

    return (
        <div>
            <h1>
                Your saved searches.
            </h1>

            <Accordion>

                {searches.map((location, idx) => {
                    return (
                        <Accordion.Item eventKey={idx}>
                            <Accordion.Header>
                                <b className="text-center text-capitalize">
                                    {location.title}
                                </b>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="text-left">
                                    <u>Comments:</u> {location.userComments}
                                </div>
                                <div className="text-sm text-muted text-center">
                                    {location.city ? `${location.city}, ` : null}
                                    {location.county ? `${location.county}, ` : null}
                                    {location.state}
                                </div>
                                <Link
                                    className="btn btn-primary font-weight-bold mr-3"
                                    to='/search'
                                    key={location.id}>
                                    <span
                                        onClick={() => handleGoTo(location)}>
                                        Go To Map
                                    </span>
                                </Link>
                            </Accordion.Body>
                        </Accordion.Item>
                    )
                })}
            </Accordion>
        </div>
    )
}


export default SavedSearches;

