import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
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

            {searches.map((search) => {
                console.log(search);
                return (
                    <Link
                        className="btn btn-primary font-weight-bold mr-3"
                        to='/search'>
                        <span
                            onClick={(search) => handleGoTo(search)}>
                            Test Search
                        </span>
                    </Link>
                )
            })}
        </div>
    )
}


export default SavedSearches;

