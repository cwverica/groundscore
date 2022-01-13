import { useEffect } from 'react';
import Plot from 'react-plotly.js';

import GroundScoreApi from '../api/gs-api';
import CacheLayer from '../api/cache-layer';
import "./Data.css";

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
    "violent-crime"
];

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




function Data({
    setStatus,
    status,
    setCrimeData,
    crimeData,
    search
}) {

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
                    return Math.sqrt(
                        Math.pow(
                            (x1 - x2), 2
                        ) +
                        Math.pow(
                            (y1 - y2), 2
                        )
                    );
                }
                let distance1 = calculateDistance(
                    agency1.lat,
                    agency1.lng,
                    location.lat,
                    location.lng
                );
                let distance2 = calculateDistance(
                    agency2.lat,
                    agency2.lng,
                    location.lat,
                    location.lng
                );

                return distance1 - distance2;
            });
            agency = agencyList[0];

        } else {
            agency = await GroundScoreApi.getAgencyByOri(search.closestOri);
        }
        const crimes = await CacheLayer.getCrimesByOriAndYears(agency.ori, STARTYEAR, ENDYEAR);


        for (let i = STARTYEAR; i <= ENDYEAR; i++) {
            if (Array.isArray(crimes[i])) {
                crimes[i].forEach((crime) => {
                    newCrimeData[crime.offense].years.push(i);
                    newCrimeData[crime.offense].actual.push(crime.actualCases);
                    newCrimeData[crime.offense].cleared.push(crime.clearedCases);
                });
            } else {
                newCrimeData.errorMessages = newCrimeData.errorMessages || [];
                newCrimeData.errorMessages.push(`Missing dataset has not been supplied by Agency for year ${i}.${<br />}`);
            }
        }
        // console.log(newCrimeData.errorMessages);
        if (newCrimeData.errorMessages
            && newCrimeData.errorMessages.length === 5) {
            setStatus("no-data");
            return;
        }
        setCrimeData(newCrimeData);
        setStatus("ready");

    }

    function createContent() {
        if (status === "empty") {
            return (
                <h2>
                    <br />
                    <br />
                    Please select a location in the contiguous United States
                    to get started.
                </h2>
            );
        }

        if (status === "loading") {
            loadData(search);
            return (
                <div>
                    <h2>
                        <br />
                        <br />
                        Please wait. Loading...
                    </h2>
                    <br />
                    <p>
                        This can take up to 30 seconds, as the FBI database
                        is comprised of billions of entries.
                    </p>
                </div>
            );
        }

        if (status === "ready") {
            const crimeGraphs = crimeList.map((crime) => {
                let data = crimeData[crime];
                return (
                    <Plot
                        data={[
                            {
                                type: 'bar',
                                x: data.years,
                                y: data.cleared,
                                name: "Cleared",
                                marker: {
                                    color: "#56a0d3"
                                }
                            },
                            {
                                type: 'bar',
                                x: data.years,
                                y: data.actual,
                                name: "Actual",
                                marker: {
                                    color: "#ff5a36"
                                }
                            }
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
                        config={{
                            displayModeBar: false
                        }}
                    />
                );
            })

            const errors = crimeData.errorMessages || null;
            return (<div>
                <h1>Crime for {search.city}, {search.state}</h1>
                <div className="notes">
                    A few notes:
                    <ul>
                        <li>
                            <b>
                                <u>
                                    Cleared cases
                                </u>
                                :&nbsp;
                            </b>
                            indicates number of cases that have been solved/closed.
                        </li>
                        <li>
                            <b>
                                <u>
                                    Actual cases
                                </u>
                                :&nbsp;
                            </b>
                            indicates the total number of reported cases.
                        </li>
                        <li>
                            <u>
                                Cleared vs. Actual
                            </u>
                            : Comparing these two will give a rough estimate
                            of the effectiveness of the local law enforcement's
                            ability to solve cases.
                            <i>
                                &nbsp;Note:&nbsp;
                            </i>
                            this comparison has nothing to do with prevention. The "Actual
                            cases" is the most accurate representation of crime in the area.
                        </li>
                        <li>
                            <u>
                                If a graph seems particularly empty
                            </u>
                            : remember that the data is based on reported numbers by
                            local agencies. They may have failed to report accurately.
                        </li>
                        <li>
                            <u>
                                RE: Human trafficing
                            </u>
                            : There seems to be almost no reporting for this subject.
                            It's likely that many local agencies are not aware of,
                            nor involved in trafficing cases. This task is usually
                            left to federal agencies.
                        </li>
                        <li>
                            <u>
                                Rape vs. Rape Legacy
                            </u>
                            : In 2013, the FBI started collecting rape data under a
                            revised definition and removed “forcible” from the offense
                            name. Legacy refers to crimes catalogued under the old
                            definition. Whichever definition an agency uses to report,
                            the FBI estimates the other via a complex calculation.
                        </li>
                    </ul>
                </div>
                {errors}
                {crimeGraphs}
            </div>);
        }

        if (status === "no-data") {
            return (
                <div>
                    <h2>
                        <br />
                        <br />
                        There is no data available.
                    </h2>
                    <br />
                    <p>
                        Not all agencies report their data consistently enough. It
                        looks like you've found one of those agencies.
                    </p>
                </div>
            );
        }
    }


    return <div id="data-container">
        {createContent()}
    </div>
}


export default Data;

