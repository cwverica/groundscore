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
     *  { ori, recordYear } = > [{ori, recordYear, offense, actualCases, clearedCases}, ...]
     */

    static async getByYear({ ori, recordYear }) {

        const result = await db.query(
            `SELECT ori,
                    record_year AS "recordYear",
                    offense,
                    actual_cases AS "actualCases",
                    cleared_cases AS "clearedCases"
             FROM Crimes
             WHERE ori = $1
             AND record_year = $2`,
            [ori, recordYear],
        );

        const search = result.rows;

        return search;

    };


    /** Create entry in Crimes table given the data
     * 
     *  { ori, recordYear, offense, actualCases, clearedCases } => { saved: true }
    */

    static async save({ ori, recordYear, offense, actualCases, clearedCases }) {

        const check = await db.query(
            `SELECT ori
             FROM Reporting_Agencies
             WHERE ori = $1`,
            [ori]
        );

        if (!check.rows[0]) throw new NotFoundError(`No Agency found with ori: ${ori}`);

        let save = await db.query(
            `INSERT INTO Crimes 
                (ori, 
                 record_year,
                 offense, 
                 actual_cases, 
                 cleared_cases)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ori,
                       record_year AS "recordYear",
                       offense`,
            [ori, recordYear, offense, actualCases, clearedCases]);

        if (!save.rows[0]) throw new BadRequestError(`Something went wrong saving this crime.`);
        return { saved: true };
    }

}



module.exports = Crime;
