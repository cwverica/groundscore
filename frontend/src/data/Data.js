
import Plot from 'react-plotly.js';
import { useEffect, useContext } from 'react';
import GroundScoreApi from '../api/gs-api';
import CacheLayer from '../api/cache-layer';
import calculateDistance from '../common/helpers';
import StaticModal from "./StaticModal";

import SearchContext from "../context/SearchContext";
import UserContext from "../context/UserContext";
import stareAtMap from "../static/images/cute/stare_at_map.png";
import crimeScene from "../static/images/cute/crime_scene.png";
import spying from "../static/images/cute/spying.png";

import "./Data.css";

// Set as constants for now, maybe later could be user input
const STARTYEAR = 2016;
const ENDYEAR = 2020;


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


function Data({ setCrimeData, crimeData }) {

    const {
        setStatus,
        status,
        search,
        setSearch,
        setSelected
    } = useContext(SearchContext);

    const { currentUser } = useContext(UserContext);

    useEffect(() => {
        return () => {
            setSelected(null);
            setStatus("empty");
        }
    }, []);

    async function loadData(search) {
        let agency, closestOri, locationId, crimes;
        let newCrimeData = {};
        Object.keys(crimeDisplayTitles).forEach((crime) => {
            newCrimeData[crime] = {
                "years": [],
                "actual": [],
                "cleared": [],
                "displayTitle": crimeDisplayTitles[crime]
            };
        });


        try {
            if (search.id === "temp") {
                const location = await CacheLayer.getOrCreateLocation(search);
                const agencyList = await CacheLayer.getAgenciesByState(location.state);
                agencyList.sort((agency1, agency2) => {
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
                closestOri = agency.ori;
                locationId = location.id;
            } else {
                agency = await GroundScoreApi.getAgencyByOri(search.closestOri);
                closestOri = search.closestOri;
                locationId = search.locationId;
            }
            crimes = await CacheLayer.getCrimesByOriAndYears(agency.ori, STARTYEAR, ENDYEAR);
        } catch (err) {
            console.log(err);
            setStatus("empty");
        }


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
        if (newCrimeData.errorMessages
            && newCrimeData.errorMessages.length === 5) {
            setStatus("no-data");
            return;
        }
        setCrimeData(newCrimeData);
        setStatus("ready");
        setSearch((search) => {
            return {
                ...search,
                closestOri,
                locationId
            }
        });

    }


    function createContent() {
        if (status === "empty") {
            return (
                <div>
                    <h2>
                        <br />
                        <br />
                        Please select a location in the contiguous United States
                        to get started.
                    </h2>
                    <p>
                        Use the search bar to search by address, or click on the map.
                    </p>
                    <img className="data-detective-image" src={stareAtMap} />
                </div>
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
                    <img className="data-detective-image" src={spying} />
                    <br />
                    <p>
                        This can take up to 30 seconds, as the FBI database
                        is comprised of billions of entries.
                    </p>
                </div>
            );
        }

        if (status === "ready") {
            const crimeGraphs = Object.keys(crimeDisplayTitles).map((crime) => {
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
                            staticPlot: true
                        }}
                        key={data.displayTitle}
                    />
                );
            })

            const errors = crimeData.errorMessages || null;
            return (<div>
                <h1
                >Crime for {search.city}, {search.state}
                    {currentUser ? <StaticModal
                        currentSearch={search}
                    />
                        :
                        null}
                </h1>
                <div className="notes">
                    A few notes:
                    <ul>
                        <li>
                            <strong>
                                Cleared cases
                            </strong>
                            :
                            indicates number of cases that have been solved/closed.
                        </li>
                        <li>
                            <strong>
                                Actual cases
                            </strong>
                            :
                            indicates the total number of reported cases.
                        </li>
                        <li>
                            <em>
                                Cleared vs. Actual
                            </em>
                            : Comparing these two will give a rough estimate
                            of the effectiveness of the local law enforcement's
                            ability to solve cases.
                            <em>
                                &nbsp;Note:&nbsp;
                            </em>
                            this comparison has nothing to do with prevention. The "Actual
                            cases" is the most accurate representation of crime in the area.
                        </li>
                        <li>
                            <em>
                                If a graph seems particularly empty
                            </em>
                            : remember that the data is based on reported numbers by
                            local agencies. They may have failed to report accurately.
                        </li>
                        <li>
                            <em>
                                RE: Human trafficing
                            </em>
                            : There seems to be almost no reporting for this subject.
                            It's likely that many local agencies are not aware of,
                            nor involved in trafficing cases. This task is usually
                            left to federal agencies.
                        </li>
                        <li>
                            <em>
                                Rape vs. Rape Legacy
                            </em>
                            : In 2013, the FBI started collecting rape data under a
                            revised definition and removed “forcible” from the offense
                            name. Legacy refers to crimes catalogued under the old
                            definition.
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
                    <img className="data-detective-image" src={crimeScene} />
                    <p>
                        Not all agencies report their data consistently enough. It
                        looks like you've found one of those agencies.
                    </p>
                </div>
            );
        }
    }


    return <div>
        {createContent()}
    </div>
}


export default Data;

