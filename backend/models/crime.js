"use strict";

const db = require("../db");;
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for crimes. */

class Crime {


    /** Get Search: returns an array of crime objects matching the ori and record year
     * 
     *  { ORI, recordYear } = > [{ORI, recordYear, offense, actualCases, clearedCases}, ...]
     */

    static async getByYear({ ORI, recordYear }) {

        const result = await db.query(
            `SELECT ORI,
                    record_year AS "recordYear",
                    offense,
                    actual_cases AS "actualCases",
                    cleared_cases AS "clearedCases"
             FROM Crimes
             WHERE ORI = $1
             AND record_year = $2`,
            [ORI, recordYear],
        );

        const search = result.rows[0];

        return search;

    };


    /** Create entry in Crimes table given the data
     * 
     *  { ORI, recordYear, offense, actualCases, clearedCases } => { saved: true }
    */

    static async save({ ORI, recordYear, offense, actualCases, clearedCases }) {

        const check = await db.query(
            `SELECT ORI
             FROM Reporting_Agencies
             WHERE ORI = $1`,
            [ORI]
        );

        if (!check.rows[0]) throw new NotFoundError(`No Agency found with ORI: ${ORI}`);

        let save = await db.query(
            `INSERT INTO Crimes 
                (ORI, 
                 record_year,
                 offense, 
                 actual_cases, 
                 cleared_cases)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [ORI, recordYear, offense, actualCases, clearedCases]);

        if (!save.rows[0]) throw new BadRequestError(`Something went wrong saving this crime.`);
        return { saved: true };
    }

}



module.exports = Crime;
