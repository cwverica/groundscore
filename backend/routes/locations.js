"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Location = require("../models/location");
const locationNewSchema = require("../schemas/locationNew.json");

const router = express.Router();


/** GET /[id]  => { location }
 * 
 *  returns the location object matching the id
 *      { id, lat, lnd, city, state }
 */

router.get("/:id", async function (req, res, next) {
    try {
        const location = await Location.get(req.params.id);
        return location;
    } catch (err) {
        return next(err);
    }
});


/** POST /fndId  { lat, lng } => {id} */

router.post("/findId", async function (req, res, next) {
    try {
        const location = await Location.findId(req.body);
        return location;
    } catch (err) {
        return next(err);
    }
});


/** POST /findNearby { city, state } => { location }
 * 
 *  takes an object with city and state,
 *      returns [{ id, lat, lng, city, state}, ...]
 */

router.post("/findNearby", async function (req, res, next) {
    try {
        const locations = await Location.findNearby(req.body);
        return locations;
    } catch (err) {
        return next(err);
    }
});


/** POST / { locationData } => { location }
 * 
 *  Adds new location to the database.
 * 
 *  locationData should be { latLngObj, city, state }
 *        where latLngObj = { lat, lng }
 *  returns { id, lat, lng, city, state }
 */

router.post("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, locationNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const location = await Location.create(req.body);
        return location;
    } catch (err) {
        return next(err);
    }
});
