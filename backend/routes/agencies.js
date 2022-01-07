"use strict";

/** Routes for agencies. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Agency = require("../models/agency");
const agencyNewSchema = require("../schemas/agencyNew.json"); // TODO: this

const router = express.Router();


/** GET /[ori] => { ori, name, lat, lng, counties, state }
 * Retrieves an an agency object from given ori
 */

router.get("/:ori", async function (req, res, next) {
    try {
        const { ori } = req.params;
        const agency = await Agency.get(ori);
        return res.json({ agency });
    } catch (err) {
        return next(err);
    }
});


/** GET /state/[state] => [{ ori, name, lat, lng, counties, state }, ...]
 * Retrieves a list of agency objects from given 2-character state abbreviation
 */

router.get("/state/:state", async function (req, res, next) {
    try {
        const { state } = req.params;
        const agencies = await Agency.getByState(state);
        return res.json({ agencies });
    } catch (err) {
        return next(err);
    }
});


/** POST agencyObjectData => boolean 
 * 
 *  Saves a new agency to the database. agencyObjectData should be of form:
 *  { ori, name, lat, lng, counties, state }
*/

router.post("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, agencyNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const outcome = await Agency.save(req.body);
        return res.json({ success: outcome.saved ? true : false });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;