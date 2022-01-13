import { useState } from 'react';

import Map from "../map/Map";
import Data from "../data/Data";

import "./Search.css"




function Search() {


    const [status, setStatus] = useState("empty")
    const [search, setSearch] = useState({});
    const [crimeData, setCrimeData] = useState({});



    return (
        <div id="main-container">
            <div id="map-container">
                <Map
                    setStatus={setStatus}
                    setSearch={setSearch} />
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
