import GroundScoreAPI from './gs-api';
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


    static async getORIsByState(state) {
        let ORIList = await GroundScoreAPI.getAgenciesByState(state);

        if (ORIList.length === 0) {
            let tempList = await FBIAPI.getAgenciesByState(state);
            ORIList = tempList.map((agency) => {
                const agencyObj;
                agencyObj.ORI = agency.ori;
                agencyObj.name = agency.agency_name;
                agencyObj.lat = agency.latitude;
                agencyObj.lng = agency.longitude;
                agencyObj.counties = agency.county_name.split(";").map((county) => county.trim());

                GroundScoreAPI.addAgency(agencyObj);

                return agencyObj;
            });
        }

        return ORIList;
    }


    /** startYear and endYear bounds are inclusive.
     * i.e. startYear = 2005, endYear = 2005 will return the results for 2005
     */

    static async getCrimesByORIAndYears(ORI, startYear, endYear) {
        if (startYear > endYear) throw new Error("Start year must be before end year.");

        let crimes = {};
        let missingYears = [];
        for (let i = startYear; i <= endYear; i++) {
            let crimeYear = await GroundScoreAPI.getORICrimeDataByYear(ORI, i);
            if (crimeYear.length === 0) {
                missingYears.push(i);
            } else {
                crimes[i] = crimeYear;
            }
        }
        if (missingYears.length > 0) {
            let missingStart = missingYears[0];
            let missingEnd = missingYears[missingYears.length - 1];
            let newData = await FBIAPI.getCrimesFromORI({ ORI, startYear: missingStart, endYear: missingEnd });
            newData.forEach((crime) => {
                let currentYear = crime.data_year;
                if (missingYears.includes(currentYear)) {
                    crimes[currentYear] = crimes[currentYear] || [];
                    let newCrimeObj = {};
                    newCrimeObj.ORI = crime.ori;
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
    }
}


export default CacheLayer;