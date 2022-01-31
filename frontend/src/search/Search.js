import {
    useState
} from 'react';

import Map from "../map/Map";
import Data from "../data/Data";

import "./Search.css"




function Search() {


    const [crimeData, setCrimeData] = useState({});

    return (
        <div id="main-container">
            <div id="map-container">
                <Map />
            </div>

            <div id="data-container">
                <Data
                    setCrimeData={setCrimeData}
                    crimeData={crimeData} />
            </div>

        </div>
    )
}


export default Search;
