import {
    useState
} from 'react';

import Map from "../map/Map";
import Data from "../data/Data";

import "./Search.css"


/** The overall container for the two components 
 * <Map> which displays the map, on selection, passes the location information to data.
 * and 
 * <Data> which handles the displaying of all the crime data from the location passed to it.
 */

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
