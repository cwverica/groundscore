"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Search = require("../models/search");
const searchNewSchema = require("../schemas/searchNew.json");
const searchUpdateSchema = require("../schemas/searchUpdate.json");

const router = express.Router();


/** GET /[id]  => {id, title, username, locationId, closestOri, createdAt, userComments}
 * 
 */

router.get("/:id", async function (req, res, next) {
    try {
        const search = await Search.get(id);
        return res.json({ search });
    } catch (err) {
        return next(err);
    }
});


/** Get /byUser/[username]  => 
 *      [{id, title, username, locationId, closestOri, createdAt, userComments,
 *          lat, lng, county, state}, ...]
 * 
 *  Returns array of all saved searches by user.
 * 
 * Authorization required: admin or same-user-as-:username
 */

router.get("/byuser/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const searches = await Search.getAllByUser(req.params.username);
        return res.json({ searches });
    } catch (err) {
        return next(err);
    }
});


/** POST /[username]  { locationId, title, closestORI, userComments } => 
 *
 * Returns {"saved": searchId}
 *
 * Authorization required: admin or same-user-as-:username
 * */

router.post("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, searchNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body.username = req.params.username;
        const search = await Search.save(req.body);
        return res.status(201).json({ "saved": search.id, "title": search.title });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[username]  {updateData} => { search }
 * This accepts partial updates, you do not need to include everything only 
 * including the id is a requirement. Data can also include title and/or 
 * userComments
 * updateData is: { id , data }
 *      where data is: { title (optional), userComments (optional) }
 *
 * Returns {id, title, username, locationId, closestOri, createdAt, userComments}
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, nest) {
    try {
        const validator = jsonschema.validate(req.body, searchUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body.username = req.params.username;
        const search = await Search.update(req.body);
        return res.json({ "saved": search.id, "title": search.title });
    } catch (err) {
        return next(err);
    }
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: admin 
 **/

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Search.delete(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});



module.exports = router;
