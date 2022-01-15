import react from 'react';
import { Link } from 'react-router-dom';

function SavedSearches() {

    const testSearch = {
        pathname: "/search",
        selected: {
            lat: 39.4302853,
            lng: -75.6486525,
            state: "DE",
            city: "Townsend",
            county: "New Castle"
        }
    };


    return (
        <div>
            <h1>
                You don't belong here yet.
            </h1>
            <Link
                className="btn btn-primary font-weight-bold mr-3"
                to="/">
                Go Home
            </Link>

            <Link
                className="btn btn-primary font-weight-bold mr-3"
                to={testSearch}>
                Test Search
            </Link>
        </div>
    )
}


export default SavedSearches;

