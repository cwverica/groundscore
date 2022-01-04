import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class GroundScoreApi {

    static token;  // the token for interacting with the API will be stored here.

    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", endpoint, data, method);

        const url = `${BASE_URL}/${endpoint}`;
        const headers = { Authorization: `Bearer ${GroundScoreApi.token}` };
        const params = (method === "get")
            ? data
            : {};

        try {
            let res = (await axios({ url, method, data, params, headers })).data;
            return res;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    //////// Individual API routes




    // User related routes


    /** Get token for login from username and password. */

    static async login(data) {
        let res = await this.request(`auth/token`, data, "post");
        return res.token;
    }

    /** Signup for site. */

    static async signup(data) {
        let res = await this.request(`auth/register`, data, "post");
        console.log(res);
        const token = res.token;
        return token;
    }

    /** Save user profile page. */

    static async saveProfile(username, data) {
        let res = await this.request(`users/${username}`, data, "patch");
        return res.user;
    }

    /** Get the current user. */

    static async getCurrentUser(username) {
        let res = await this.request(`users/${username}`);
        const user = res.user;
        res = await this.request(`searches/byuser/${username}`);
        user.searches = res.searches || [];
        return user;
    }

    /** Authenticate user */

    static async authenticateUser(username, password) {
        let res = await this.request('auth/token', { username, password }, "post");
        if (res.token) {
            return { success: true, token: res.token };
        } else {
            return { success: false, err: res.unauth };
        }
    }




    // Location related routes

    /** Gets a location ID by the object { lat, lng } that is passed to it. */

    static async getLocationByLatLng(latLngObj) {
        let res = await this.request(`locations/findId`, latLngObj, "post");
        return res.location;
    };

    /** Gets a location object { id, lat, lng, county, state } by the provided ID */

    static async getLocationById(id) {
        let res = await this.request(`locations/${id}`);
        return res.location;
    };

    /** Creates a new location in the database from supplied data. 
     * data: { lat, lng , state, county (optional)}
     * 
     * returns { id, lat, lng, county, state }
     */

    static async createNewLocation(data) {
        let res = await this.request(`locations/`, data, "post");
        return res.location;
    }




    // Search related routes

    /** get all searches for supplied username */

    static async getUserSearches(username) {
        let res = await this.request(`searches/byuser/${username}`);
        return res.searches;
    }




    // Post related routes




    // Comment related routes




    // Crime related routes

    /** Retrieves data for each crime type from ORI by year */

    static async getORICrimeDataByYear(ORI, recordYear) {
        let res = await this.request(`crimes/${ORI}/${recordYear}`);
        return res.records;
    };

    /** Creates new crime object in database based on supplied data.
     *  data: { ORI, recordYear, offense, actualCases, clearedCases }
     */

    static async createNewCrime(data) {
        let res = await this.request(`crimes/`, data, "post");
        return res;
    }




    // Agency related routes

    /** Add Agency to database */

    static async addAgency(data) {
        let res = await this.request(`agencies/`, data, "post");
        if (res.success) {
            console.log("Successfully added");
            return true;
        } else {
            console.log("Add failed!");
            return false;
        }
    };

    /** Get a list of agencies by 2-character state abbreviation */

    static async getAgenciesByState(state) {
        let res = await this.request(`agencies/state/${state}`);
        return res.agencies;
    };

    /** Get an agency object from ORI */

    static async getAgencyByORI(ORI) {
        let res = await this.request(`agencies/${ORI}`);
        return res.agency;
    }


}

// for now, put token ("testuser" / "password" on class)
GroundScoreApi.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ" +
    "SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0." +
    "FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc";

export default GroundScoreApi;
