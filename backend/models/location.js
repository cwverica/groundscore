"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

class Location {


    /** 
     *  Searches through locations by latitude and longitude
     * 
     * returns matching location or undefined
     */
    static async findId(latLngObj) {

        const { lat, lng } = latLngObj;

        const result = await db.query(
            `SELECT id
                    FROM Locations
                    WHERE lat = $1,
                        lng = $2`,
            [lat, lng],
        );

        const id = result.rows[0];

        return id;
    }


    /** Creates a new location out of:
     *  -a latLngObj 
     *  -city 
     *  -state (2 character abbreviation) 
     *  -population (positive integer)
     * 
     * Location object is { lat, lng, }
     * 
     *  Returns newly created location object 
     */

    static async createLocation(latLngObj, city, state, population) {

        const { lat, lng } = latLngObj;

        const result = await db.query(
            `INSERT INTO Locations
                   (lat,
                    lng,
                    city,
                    state, 
                    population)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, lat, lng, city, state, population`,
            [
                lat,
                lng,
                city,
                state,
                population
            ]
        );

        const location = result.rows[0];

        return location;
    }


    /** Searches database for all locations that exist in
     *  provided city, state.
     * 
     * returns an array of location objects of form
     * [{id, lat, lng, city, state, population}, ...]
     *  or an empty array if no matches found
     */
    static async findNearby(city, state) {
        const result = await db.query(
            `SELECT id,
                     lat,
                     lng,
                     city,
                     state,
                     population
             FROM Locations
             WHERE city = $1,
                   state = $2`,
            [city, state]
        );

        return result.rows;
    }


}
