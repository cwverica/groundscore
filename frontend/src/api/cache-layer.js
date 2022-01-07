import FBIAPI from './FBIApi';
import GroundScoreApi from './gs-api';


/** This class is used as a one call caching operation. It checks the database
 *  to see if the needed data is already contained within. If it does not find
 *  it, it then calls to the FBI database to retrieve the required data.
 * 
 *  This may cause a small perfomance hit on any new retrievals, but in the long
 *  run will save time, as the FBI database can take upwards of 10 seconds.
 */

class CacheLayer {


    static async getOrCreateLocation(search) {

        let location;
        try {
            const id = await GroundScoreApi.getLocationByLatLng(search);

            if (!location) {
                location = await GroundScoreApi.createNewLocation(search);
            } else {
                location = await GroundScoreApi.getLocationById(id);
            }

            return location;
        } catch (err) {
            console.log(err);
        }
    }


    static async getAgenciesByState(state) {
        try {
            let agencyList = await GroundScoreApi.getAgenciesByState(state);

            if (agencyList.length === 0) {
                let tempList = await FBIAPI.getAgenciesByState(state);
                agencyList = tempList.map((agency) => {
                    let agencyObj = {};
                    agencyObj.ori = agency.ori;
                    agencyObj.name = agency.agency_name;
                    agencyObj.lat = agency.latitude;
                    agencyObj.lng = agency.longitude;
                    agencyObj.counties = agency.county_name;
                    agencyObj.state = state;

                    GroundScoreApi.addAgency(agencyObj);

                    return agencyObj;
                });
            }
            return agencyList;
        } catch (err) {
            console.log(err);
        }
    }


    /** startYear and endYear bounds are inclusive.
     * i.e. startYear = 2005, endYear = 2005 will return the results for 2005
     */

    static async getCrimesByOriAndYears(ori, startYear, endYear) {
        if (startYear > endYear) throw new Error("Start year must be before end year.");
        try {
            let crimes = {};
            let missingYears = new Array(0);
            for (let i = startYear; i <= endYear; i++) {
                let crimeYear = await GroundScoreApi.getOriCrimeDataByYear(ori, i);
                if (!crimeYear || crimeYear.length !== 12) {
                    missingYears.push(i);
                } else {
                    crimes[i] = crimeYear;
                }
            }
            if (missingYears.length > 0) {
                let missingStart = missingYears[0];
                let missingEnd = missingYears[missingYears.length - 1];
                let newData = await FBIAPI.getCrimesFromOri({ ori, startYear: missingStart, endYear: missingEnd });
                newData.forEach((crime) => {
                    let currentYear = crime.data_year;
                    if (missingYears.includes(currentYear)) {
                        crimes[currentYear] = crimes[currentYear] || new Array(0);
                        let newCrimeObj = {};
                        newCrimeObj.ori = crime.ori;
                        newCrimeObj.recordYear = currentYear;
                        newCrimeObj.offense = crime.offense;
                        newCrimeObj.actualCases = crime.actual;
                        newCrimeObj.clearedCases = crime.cleared;

                        GroundScoreApi.createNewCrime(newCrimeObj);

                        crimes[currentYear].push(newCrimeObj);
                    }
                });
            }
            return crimes;
        } catch (err) {
            console.log(err);
        }
    }
}


export default CacheLayer;
