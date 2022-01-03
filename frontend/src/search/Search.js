import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import GroundScoreApi from '../api/gs-api';
import FBIApi from '../api/FBIApi';
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
        return;
        if (search.id !== "temp") {
            const crimes = {};
            for (let i = STARTYEAR; i <= ENDYEAR; i++) {
                crimes[i] = crimes[i] || [];
                let crimeYear = await GroundScoreApi.getORICrimeDataByYear(search.closestOri, i);
                crimes[i].push(crimeYear);
            };
            // TODO: Here I am to SAVE THE DAAAYYY!!!!
        }
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
                {status === "ready" && crimeData.map((crime) => {
                    //do graph stuff?
                })}
            </div>

        </div>
    )
}


export default Search;
