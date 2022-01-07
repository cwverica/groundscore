import { useState } from 'react';

import GroundScoreApi from '../api/gs-api';
import CacheLayer from '../api/cache-layer';

import Map from "../map/Map";

import "./Search.css"

// Set as constants for now, maybe later could be user input
const STARTYEAR = 2016;
const ENDYEAR = 2020;



function Search() {


    const [status, setStatus] = useState("empty")
    const [search, setSearch] = useState({});
    const [crimeData, setCrimeData] = useState([]);

    async function loadData(search) {
        let agency;
        if (search.id === "temp") {
            const location = await CacheLayer.getOrCreateLocation(search);
            const agencyList = await CacheLayer.getAgenciesByState(location.state);
            agencyList.sort((agency1, agency2) => {
                function calculateDistance(x1, y1, x2, y2) {
                    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
                }
                let distance1 = calculateDistance(agency1.lat, agency1.lng, location.lat, location.lng);
                let distance2 = calculateDistance(agency2.lat, agency2.lng, location.lat, location.lng);

                return distance1 - distance2;
            });
            agency = agencyList[0];

        } else {
            agency = await GroundScoreApi.getAgencyByOri(search.closestOri);
        }
        const crimes = await CacheLayer.getCrimesByOriAndYears(agency.ori, STARTYEAR, ENDYEAR);

        for (let i = 2016; i <= 2020; i++) {
            console.log(`********${i}*********`);
            console.log(crimes[i]);
            // crimes[i].map(async (crime) => {
            //     console.log("crime:");
            //     console.log(crime);
            // });
        }
        // setCrimeData(crimes);
        // setStatus("ready");
    }

    return (
        <div id="main-container">
            <div id="map-container">
                <Map setStatus={setStatus} setSearch={setSearch} />
            </div>

            <div id="data-container">
                {status === "empty" && (
                    <h2><br /><br />Please select a location in the contiguous United States to get started.</h2>
                )}
                {status === "loading" && loadData(search)}
                {status === "ready" && (
                    <ul>
                        {crimeData.map(async (crime) => {
                            console.log("crime:");
                            console.log(crime);
                            // return <li>{await crime}</li>
                        })}
                    </ul>
                )
                }
            </div>

        </div>
    )
}


export default Search;
