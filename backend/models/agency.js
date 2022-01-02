"use strict";

const db = require("../db");;
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for crimes. */

class Agency {

    /** Get: returns an agency object matching the ORI
     * 
     *  ORI => { ORI, name, lat, lng, counties, state }
     */
    static async get(ORI) {

        const result = await db.query(
            `SELECT ORI,
                    name,
                    lat,
                    lng,
                    counties,
                    state
             FROM Reporting_Agencies
             WHERE ORI = $1`,
            [ORI],
        );

        const agency = result.rows[0];

        return agency;
    };


    /** Get Search by state: returns an array of agency objects matching the 
     *      2-character state abbreviation
     * 
     *  state = > [{ ORI, name, lat, lng, counties, state }, ...]
     */

    static async getByState(state) {

        const result = await db.query(
            `SELECT ORI,
                    name,
                    lat,
                    lng,
                    counties,
                    state
             FROM Reporting_Agencies
             WHERE state = $1`,
            [state],
        );

        const agencies = result.rows;

        return agencies;
    };


    /** Create entry in Reporting_Agencies table given the data
     * 
     *  { ORI, name, lat, lng, counties, state } => { saved: true }
    */

    static async save({ ORI, name, lat, lng, counties, state }) {

        const check = await db.query(
            `SELECT ORI
             FROM Reporting_Agencies
             WHERE ORI = $1`,
            [ORI]
        );

        if (check.rows[0]) throw new BadRequestError(`Agency found with ORI: ${ORI}`);

        let save = await db.query(
            `INSERT INTO Reporting_Agencies 
                (ORI, 
                 name,
                 lat, 
                 lng, 
                 counties,
                 state)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING ORI`,
            [ORI, name, lat, lng, counties, state]);

        if (!save.rows[0]) throw new BadRequestError(`Something went wrong saving this Agency.`);
        return { saved: true };
    }

}



module.exports = Agency;
