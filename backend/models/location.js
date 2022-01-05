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
     *  { id, lat, lng, city, county, state }  
     */

    static async get(id) {

        const result = await db.query(
            `SELECT id,
                    lat,
                    lng,
                    city,
                    county,
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

        const minLat = lat - .0005;
        const maxLat = lat + .0005;
        const minLng = lng + .0005;
        const maxLng = lng - .0005;

        const result = await db.query(
            `SELECT id
             FROM Locations
             WHERE lat > $1
             AND lat < $2
             AND lng < $3
             AND lng > $4`,
            [minLat, maxLat, minLng, maxLng],
        );

        const id = result.rows[0];

        return id;
    };


    /** Creates a new location out of:
     *  -lat
     *  -lng 
     *  -city
     *  -county 
     *  -state (2 character abbreviation)
     * 
     *  Returns newly created location object 
     */

    static async create({ lat, lng, city, county, state }) {

        const result = await db.query(
            `INSERT INTO Locations
                   (lat,
                    lng,
                    city,
                    county,
                    state)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, lat, lng, county, state`,
            [
                lat,
                lng,
                city,
                county,
                state
            ]
        );

        const location = result.rows[0];

        return location;
    };


    /** Searches database for all locations that exist in
     *  provided county, state.
     * 
     * returns an array of location objects of form
     * [{id, lat, lng, city, county, state}, ...]
     *  or an empty array if no matches found
     */
    static async findNearby({ county, state }) {
        const result = await db.query(
            `SELECT id,
                     lat,
                     lng,
                     city,
                     county,
                     state
             FROM Locations
             WHERE county = $1
             AND state = $2`,
            [county, state]
        );

        return result.rows;
    };
};


module.exports = Location;
