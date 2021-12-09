"use strict";

/** Routes for comments. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Comment = require("../models/comment");
const commentNewSchema = require("../schemas/commentNew.json");
const commentUpdateSchema = require("../schemas/commentUpdate.json");


const router = express.Router();


/** GET /[id] => { comment }
 * 
 *  Retrieves a singular comment 
 *    returns { id, username, postReferenceId, commentReferenceId,
 *                  createdAt, body }
 */

router.get("/:id", async function (res, req, next) {
    try {
        const comment = await Comment.getOne(req.params.id);
        return res.status(201).json({ comment });
    } catch (err) {
        return next(err);
    }
});


/** GET /all/[type]/[id] => { comment } 
 * 
 * Takes a id and type (either "post" or "comment") and returns the 
 * comment and all children to three levels
 *    returns {comment} as { id, username, postReferenceId, commentReferenceId,
 *                  createdAt, body, comments }
 *    comments is [ {comment}, {comment}, ...] or null
 * 
*/

router.get("/all/:type/:id", async function (res, req, next) {
    if (req.params.type !== "post" || "comment") return next(new BadRequestError(`Invalid type:
        ${type} \nType must either be "comment" or "post"`));

    try {
        const comment = await Comment.getAllByReference(req.params.id, req.params.type);
        return comment;
    } catch (err) {
        return next(err);
    }
});


/** POST /[username] { commentData } => { comment }
 * 
 *  Adds a new comment to the database
 * commentData should be { referenceId, body }
 *  where referenceId is either commentReferenceId or postReferenceId
 *      returns { id, username, commentreferenceId, postReferenceID, createdAt, body}
*/

router.post("/:username", ensureCorrectUserOrAdmin, async function (res, req, next) {
    try {
        const validator = jsonschema.validate(req.body, commentNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body.username = req.params.username;
        const comment = await Comment.create(req.body);
        return res.status(201).json({ comment });
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[username] { id, textBody } => { comment } 
 * 
 *  Updates a comment. Only the body of a comment can be changed, 
 *      so the data will be the id for reference and the body
 *  Returns the whole comment object
 *      { id, username, commentreferenceId, postReferenceID, createdAt, body}
*/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (res, req, next) {
    try {
        const validator = jsonschema.validate(req.body, commentUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        req.body.username = req.params.username;
        const comment = await Comment.update(req.body);
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
        await Comment.delete(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
