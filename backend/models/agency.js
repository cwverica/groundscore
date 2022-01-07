"use strict";

const db = require("../db");;
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for crimes. */

class Agency {

    /** Get: returns an agency object matching the ori
     * 
     *  ori => { ori, name, lat, lng, counties, state }
     */
    static async get(ori) {

        const result = await db.query(
            `SELECT ori,
                    name,
                    lat,
                    lng,
                    counties,
                    state
             FROM Reporting_Agencies
             WHERE ori = $1`,
            [ori],
        );

        const agency = result.rows[0];

        return agency;
    };


    /** Get Search by state: returns an array of agency objects matching the 
     *      2-character state abbreviation
     * 
     *  state = > [{ ori, name, lat, lng, counties, state }, ...]
     */

    static async getByState(state) {

        const result = await db.query(
            `SELECT ori,
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
     *  { ori, name, lat, lng, counties, state } => { saved: true }
    */

    static async save({ ori, name, lat, lng, counties, state }) {

        const check = await db.query(
            `SELECT ori
             FROM Reporting_Agencies
             WHERE ori = $1`,
            [ori]
        );

        if (check.rows[0]) throw new BadRequestError(`Agency found with ori: ${ori}`);

        let save = await db.query(
            `INSERT INTO Reporting_Agencies 
                (ori, 
                 name,
                 lat, 
                 lng, 
                 counties,
                 state)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING ori`,
            [ori, name, lat, lng, counties, state]);

        if (!save.rows[0]) throw new BadRequestError(`Something went wrong saving this Agency.`);
        return { saved: true };
    }

}



module.exports = Agency;
