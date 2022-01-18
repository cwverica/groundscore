import { useContext } from 'react';
import { Link } from 'react-router-dom';
import SearchContext from "../context/SearchContext";

function SavedSearches() {

    const { setSelected, setSearch, setStatus } = useContext(SearchContext);

    const testLoc = {
        // id: "temp",
        closestOri: "DE0020200",
        lat: 39.4302853,
        lng: -75.6486525,
        state: "DE",
        city: "Townsend",
        county: "New Castle"
    };

    const testSearch = {
        pathname: "/search",
        state: {
            selected: testLoc
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

            <button onClick={() => {
                setSelected(testLoc)
                setSearch(testLoc)
                setStatus("loading")
            }}>
                Set Selected
            </button>
        </div>
    )
}


export default SavedSearches;

