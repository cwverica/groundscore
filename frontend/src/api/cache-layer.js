import GroundScoreAPI from './gs-api';
import FBIAPI from './FBIApi';
import GroundScoreApi from './gs-api';

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

                (await GroundScoreAPI.addAgency({ ...agencyObj }))

                return { ...agencyObj };
            });
        }
    }


    /** startYear and endYear bounds are inclusive.
     * i.e. startYear = 2005, endYear = 2005 will return the results for 2005
     */

    static async getCrimesByORIAndYears(ORI, startYear, endYear) {
        if (startYear > endYear) throw new Error("Start year must be before end year.");

        let crimes = {};
        let missingYears = [];
        for (let i = startYear; i <= endYear; i++) {
            let crimeYear = await GroundScoreAPI.getORICrimeDataByYear({ ORI, i });
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
                    let newCrimeObj = {};
                    newCrimeObj.ORI = crime.ori;
                    newCrimeObj.recordYear = currentYear;
                    newCrimeObj.offense = crime.offense;
                    newCrimeObj.actualCases = crime.actual;
                    newCrimeObj.clearedCases = crime.cleared;
                    await GroundScoreApi.createNewCrime({ ...newCrimeObj });
                    crimes[currentYear].push({ ...newCrimeObj });
                }
            });
        }
        return crimes;
    };
};


export default CacheLayer;


[
    {
        1990: [...data]
    },
    {
        1991: [...data]
    },
    {
        1992: [...data]
    }
]