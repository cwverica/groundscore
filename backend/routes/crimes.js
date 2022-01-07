"use strict";

/** Routes for crimes. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Crime = require("../models/crime");
const crimeNewSchema = require("../schemas/crimeNew.json");

const router = express.Router();


/** GET /[ori]/[recordYear] => [{ori, recordYear, offense, actualCases, clearedCases}, ...]
 * Retrieves an array of records. Will be length 12 - one for each type of offense.
 * 
 * Included offenses are (by used title in alphabetical order): 
 *      aggravated-assault, arson, burglary, homicide, human-trafficing, larcey.
 *      motor-vehicle-theft, property-crime, rape, rape-legacy, robbery, violent-crime
*/

router.get("/:ori/:recordYear", async function (req, res, next) {
    try {
        const { ori, recordYear } = req.params;
        const records = await Crime.getByYear({ ori, recordYear });
        return res.json({ records });
    } catch (err) {
        return next(err);
    }
});


/** POST crimeObjectData => boolean 
 * 
 *  Saves a new crime to the database. crimeObjectData should be of form:
 *  { ori, recordYear, offense, actualCases, clearedCases }
 *  record year must be after 1950, actualCases and clearedCases cannot be negative 
 *  offense must be one of the 12 standard types:
 *      aggravated-assault, arson, burglary, homicide, human-trafficing, larcey.
 *      motor-vehicle-theft, property-crime, rape, rape-legacy, robbery, violent-crime
*/

router.post("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, crimeNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const outcome = await Crime.save(req.body);
        return res.json({ success: outcome.saved ? true : false });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;