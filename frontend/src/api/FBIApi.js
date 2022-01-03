import axios from "axios";

import { FBI_API } from "../keys";


const stateAbbreviations =
    [
        "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "ID", "IL",
        "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
        "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "OH", "OK", "OR", "PA",
        "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ];

const BASE_URL = "https://api.usa.gov/crime/fbi/sapi/api";

/** API Class.
 * 
 * Deals with calls to the FBI API only.
 */

class FBIAPI {

    static async request(endpoint, data = {}, method = "get") {

        const url = `${BASE_URL}/${endpoint}`;
        const headers = { "X-Api-Key": FBI_API.KEY };
        const params = (method === "get")
            ? data
            : {};

        try {
            let res = (await axios({ url, method, data, params, headers })).data;
            return res;
        } catch (err) {
            console.error("FBI API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    };


    // Get a list of Agencies by 2-character state abbreviation

    static async getAgenciesByState(state) {
        if (!stateAbbreviations.includes(state)) return new Error("Not a valid state abbreviation");
        let res = await this.request(`agencies/byStateAbbr/${state}`);
        return res.results;
    };


    // Get crimes from agency between given year range (inclusive bounds) 

    static async getCrimesFromORI({ ORI, startYear, endYear }) {

        let res = await this.request(`summarized/agencies/${ORI}/offenses/${startYear}/${endYear}`);
        return res.results;
    };


};


export default FBIAPI;

