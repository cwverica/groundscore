import { useState, useContext } from 'react';

import Map from "../map/Map";
import Data from "../data/Data";
import SearchContext from "../context/SearchContext";

import "./Search.css"




function Search() {

    const {
        selected,
        setSelected,
        search,
        setSearch,
        status,
        setStatus
    } = useContext(SearchContext)

    const [crimeData, setCrimeData] = useState({});


    return (
        <div id="main-container">
            <div id="map-container">
                <Map
                    setStatus={setStatus}
                    setSearch={setSearch}
                    setSelected={setSelected}
                    selected={selected} />
            </div>

            <div id="data-container">
                <Data
                    setStatus={setStatus}
                    status={status}
                    setCrimeData={setCrimeData}
                    crimeData={crimeData}
                    search={search} />
            </div>

        </div>
    )
}


export default Search;
