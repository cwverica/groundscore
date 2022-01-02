import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import GroundScoreApi from '../api/gs-api';
import FBIApi from '../api/FBIApi';
import UserContext from '../auth/UserContext';

import Map from "../map/Map";
// import DataDisplay from "../dataDisplay/DataDisplay";

import "./Search.css"


function Search() {

    const [status, setStatus] = useState("empty")
    const [search, setSearch] = useState({});
    const [crimeData, setCrimeData] = useState([]);

    async function loadData(search) {
        return;
        // if (search.id !== "temp") {

        // }
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
