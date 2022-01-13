import { useEffect } from 'react';
import Plot from 'react-plotly.js';

import GroundScoreApi from '../api/gs-api';
import CacheLayer from '../api/cache-layer';

// Set as constants for now, maybe later could be user input
const STARTYEAR = 2016;
const ENDYEAR = 2020;

const crimeList = [
    "aggravated-assault",
    "arson",
    "burglary",
    "homicide",
    "human-trafficing",
    "larceny",
    "motor-vehicle-theft",
    "property-crime",
    "rape",
    "rape-legacy",
    "robbery",
    "violent-crime"];

const crimeDisplayTitles = {
    "aggravated-assault": "Aggravated Assault",
    "arson": "Arson",
    "burglary": "Burglary",
    "homicide": "Homicide",
    "human-trafficing": "Human Trafficing",
    "larceny": "Larceny",
    "motor-vehicle-theft": "Motor Vehicle Theft",
    "property-crime": "Property Crime",
    "rape": "Rape",
    "rape-legacy": "Rape (legacy)",
    "robbery": "Robbery",
    "violent-crime": "Violent Crime"
};



function Data({ setStatus, status, setCrimeData, crimeData, search }) {

    async function loadData(search) {
        let agency;
        let newCrimeData = {};
        crimeList.forEach((crime) => {
            newCrimeData[crime] = {
                "years": [],
                "actual": [],
                "cleared": [],
                "displayTitle": crimeDisplayTitles[crime]
            };
        });

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

        for (let i = STARTYEAR; i <= ENDYEAR; i++) {

            crimes[i].forEach((crime) => {
                newCrimeData[crime.offense].years.push(i);
                newCrimeData[crime.offense].actual.push(crime.actualCases);
                newCrimeData[crime.offense].cleared.push(crime.clearedCases);
            });
        }
        setCrimeData(newCrimeData);
        setStatus("ready");

    }

    function createContent() {
        if (status === "empty") {
            return (<h2><br /><br />Please select a location in the contiguous United States to get started.</h2>);
        }
        if (status === "loading") {
            loadData(search);
            return (<div><h2><br /><br /> Please wait. Loading...</h2><br /><p> This can take up to 30 seconds, as the FBI database is comprised of billions of entries. </p></div>);
        }

        if (status === "ready") {
            const crimeGraphs = crimeList.map((crime) => {
                let data = crimeData[crime];
                return (<Plot
                    data={[
                        { type: 'bar', x: data.years, y: data.cleared, name: "cleared" },
                        { type: 'bar', x: data.years, y: data.actual, name: "actual" }
                    ]}
                    layout={{
                        width: 400,
                        height: 400,
                        title: data.displayTitle,
                        xaxis: {
                            dtick: 1,
                            title: {
                                text: "Year"
                            }
                        },
                        yaxis: {
                            title: {
                                text: "# of Cases"
                            }
                        }
                    }}
                />);
            })
            return crimeGraphs;
        }
    }


    return <div id="data-container">
        {createContent()}
    </div>
}


export default Data;

