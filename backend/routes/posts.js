"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Post = require("../models/post");
const postNewSchema = require("../schemas/postNew.json");
const postUpdateSchema = require("../schemas/postUpdate.json");

const router = express.Router();


/** GET /[locationId] =>  {post}
 *   
 *  Takes a id
 *  Returns a post 
 *      where post is { id, username, locationId, createdAt, subject, body }
 */

router.get("/:id", async function (req, res, next) {
    try {
        const post = await Post.get(req.params.id);
        return res.json({ post });
    } catch (err) {
        return next(err);
    }
});


/** GET /bylocation/[locationId] =>  [{post}, ...]
 *   
 *  Returns an array of posts referencing the locationId provided
 *      where post is { id, username, locationId, createdAt, subject, body }
 */

router.get("/bylocation/:locationId", async function (req, res, next) {
    try {
        const posts = await Post.getByLocation(req.params.locationId);
        return res.json({ posts });
    } catch (err) {
        return next(err);
    }
});


/** GET /byuser/[username] => [{post}, ...]
 *  
 * Returns an array of posts created by the user provided
 *      where post is { id, username, locationId, createdAt, subject, body }
 */

router.get("/byuser/:username", async function (req, res, next) {
    try {
        const posts = await Post.getByUser(req.params.username);
        return res.json({ posts });
    } catch (err) {
        return next(err);
    }
});


/** POST /[username] { postData } => { post } 
 * 
 * Adds a new post to the database
 * 
 * postData should be { locationId, body, subject (optional)}
 *      returns { id, username, locationId, createdAt, subject, body}
*/

router.post("/:username", ensureCorrectUserOrAdmin, async function (res, req, next) {
    try {

        const validator = jsonschema.validate(req.body, postNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body.username = req.params.username;
        const post = await Post.create(req.body);
        return res.status(201).json({ post });
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[username] {updateData} => { post }  
 * This accepts partial updates, you do not need to include everything only 
 * including the id is a requirement. Data can also include subject and/or body
 *   updateData is: { id , data }
 *      where data is: { subject (optional), body (optional) }
 *
 * Returns { id, username, locationId, createdAt, subject, body }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, postUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body.username = req.params.username;
        const post = await Post.update(req.body);
        return res.json({ post });
    } catch (err) {
        return next(err);
    }
});


/** DELETE /[id]  =>  { deleted: id }
 *
 * Does not actually delete. removes data from post, but leaves it to leave comments in tact.
 * Authorization required: admin 
 **/

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Post.delete(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});



module.exports = router;
