"use strict";

const db = require("../db");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

class Location {


    /** Get object by id
     *  Takes a location Id, 
     * returns location object:
     *  { id, lat, lng, city, state }  
     */

    static async get(id) {

        const result = await db.query(
            `SELECT id,
                    lat,
                    lng,
                    city,
                    state
             FROM Locations
             WHERE id = $1`,
            [id]
        );

        const location = result.rows[0];

        if (!location) throw new NotFoundError(`No location found with id: ${id}`);

        return location;
    };

    /** 
     *  Searches through locations by latitude and longitude
     * 
     * returns matching location's Id or undefined
     */
    static async findId(latLngObj) {

        const { lat, lng } = latLngObj;

        const result = await db.query(
            `SELECT id
             FROM Locations
             WHERE lat = $1
             AND lng = $2`,
            [lat, lng],
        );

        const id = result.rows[0];

        return id;
    };


    /** Creates a new location out of:
     *  -a latLngObj 
     *  -city 
     *  -state (2 character abbreviation)
     * 
     * Location object is { lat, lng, }
     * 
     *  Returns newly created location object 
     */

    static async createLocation({ latLngObj, city, state }) {

        const { lat, lng } = latLngObj;

        const result = await db.query(
            `INSERT INTO Locations
                   (lat,
                    lng,
                    city,
                    state)
            VALUES ($1, $2, $3, $4)
            RETURNING id, lat, lng, city, state`,
            [
                lat,
                lng,
                city,
                state
            ]
        );

        const location = result.rows[0];

        return location;
    };


    /** Searches database for all locations that exist in
     *  provided city, state.
     * 
     * returns an array of location objects of form
     * [{id, lat, lng, city, state, population}, ...]
     *  or an empty array if no matches found
     */
    static async findNearby({ city, state }) {
        const result = await db.query(
            `SELECT id,
                     lat,
                     lng,
                     city,
                     state
             FROM Locations
             WHERE city = $1
             AND state = $2`,
            [city, state]
        );

        return result.rows;
    };
};


module.exports = Location;
