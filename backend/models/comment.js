"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

class Comment {

    /** Verify that comment exists in database
     * id => {exists: boolean}
     */

    static async verifyExists(id) {

        const result = await db.query(
            `SELECT id
             FROM Comments
             WHERE id = $1`,
            [id],
        );
        const comment = result.rows[0];

        return { exists: !comment ? false : true };
    };


    /** Searches by supplied id
     * returns single comment.
     * 
     * id => { id, username, postReferenceId, commentReferenceId,
     *                   createdAt, body}
     */

    static async getOne(id) {

        const result = await db.query(
            `SELECT id,
                    username,
                    post_reference_id as "postReferenceId",
                    comment_reference_id as "commentReferenceId",
                    created_at as "createdA",
                    body
             FROM Comments
             WHERE id = $1`,
            [id]
        );
        const comment = result.rows[0];

        return comment;
    };


    /** Searches by a supplied username, return all matching comments 
     *  [{id, username, referenceId, createdAt, body}, ...]
     *  assumes username exits, please verify
    */

    static async getAllByUser(username) {

        const result = await db.query(
            `SELECT id,
                    username,
                    post_reference_id as "postReferenceId",
                    comment_reference_id as "commentReferenceId",
                    created_at as "createdAt",
                    body
             FROM Comments
             WHERE username = $1`,
            [username]
        );

        return result.rows;
    };


    /** Takes a referenceId, returns all comments related to that post.
     *      [ { id, username, postReferenceId, commentReferenceId, 
     *          createdAt, subject, body, comments }, ...]
     *  where comments is also 
     *      [ { id, username, postReferenceId, commentReferenceId, 
     *          createdAt, subject, body, comments }, ...] or null
     *   Calls to 3 levels deep. 
     *   On third level, comments = {more: boolean}
     * 
     *  assumes referenceId exists, please verify
     */

    static async getAllByReference(referenceId, refType, callNum = 1) {


        if (refType !== "comment" || "post") throw new BadRequestError(`Invalid refType:
                ${refType} \nType must either be "comment" or "post"`);

        const otherRefType = refType === "comment" ? "post" : "comment";

        const commentResult = await db.query(
            `SELECT id,
                    username,
                    created_at as "createdAt",
                    ${otherRefType}_reference_id as ${otherRefType}ReferenceId",
                    ${refType}_reference_id as ${refType}ReferenceId",
                    body
             FROM Comments
             WHERE ${refType}_reference_id = $1`,
            [referenceId]
        );
        const supComments = commentResult.rows;


        if (callNum >= 4) {
            supComments.comments = { more: (supComments.length ? true : false) };
        } else {
            if (supComments.length) {
                supComments.map(async (comment) => {
                    const comments = await Comment.findByReference(comment.id, "comment", (callNum + 1));
                    comment.comments = comments;
                });
            } else {
                supComments = { more: false }
            };
        }
        return supComments;
    };


    /** Creates a new comment from a given username, refereneceId, and body
         * 
         * This assumes that the username and referenceId have been verified.
         * Please verify that they all exist before using
         * 
         * Returns the newly created Comment object.
         */

    static async create({ username, postReferenceId = null, commentReferenceId = null, body }) {

        const result = await db.query(
            `INSERT INTO Comments
                (username,
                 post_reference_id,
                 comment_reference_id,
                 body)
            VALUES ($1, $2, $3, $4)
            RETURNING id,
                      username, 
                      post_reference_id AS "postReferenceId", 
                      comment_reference_id AS "commentReferenceId", 
                      created_at AS "createdAt", 
                      body`,
            [
                username,
                postReferenceId,
                commentReferenceId,
                body
            ],
        );

        const newComment = result.rows[0];

        return newComment;
    };


    /** Updates a comments body
     *
     * Returns { username, referenceId, body}
     *
     * Throws NotFoundError if not found.
     */

    static async update({ id, body, username }) {

        const result = await db.query(
            `UPDATE Comments 
             SET body = $1
             WHERE id = $2,
             AND   username = $3
             RETURNING id,
                  username, 
                  reference_id AS "referenceId", 
                  created_at AS "createdAt", 
                  body`,
            [body, id, username]
        );

        const comment = result.rows[0];

        if (!comment) throw new NotFoundError(`No comment with id: ${id} from user ${username}`);
        return comment;
    };


    /** Given a comment id, deletes that comment and returns undefined */

    static async delete(id) {
        let result = await db.query(
            `DELETE
             FROM Comments
             WHERE id = $1
             RETURNING id`,
            [id],
        );
        const comment = result.rows[0];

        if (!comment) throw new NotFoundError(`No comment with id: ${id}`);
    };


};


module.exports = Comment;
