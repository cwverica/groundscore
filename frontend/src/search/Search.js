import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import GroundScoreApi from '../api/gs-api';
import FBIApi from '../api/FBIApi';
import CacheLayer from '../api/cache-layer';
import UserContext from '../auth/UserContext';

import Map from "../map/Map";
// import DataDisplay from "../dataDisplay/DataDisplay";

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
            console.log(agencyList);
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
            agency = await GroundScoreApi.getAgencyByORI(search.closestOri);
        }
        const crimes = await CacheLayer.getCrimesByORIAndYears(agency.ORI, STARTYEAR, ENDYEAR);

        setCrimeData(crimes);
        setStatus("ready");
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
                        {crimeData.map((crime) => {
                            return <li>{crime}</li>
                        })}
                    </ul>
                )
                }
            </div>

        </div>
    )
}


export default Search;
