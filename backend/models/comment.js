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
     * commentId => {exists: boolean}
     */

    static async verifyExists(commentId) {

        const result = await db.query(
            `SELECT id
             FROM Comments
             WHERE id = $1`,
            [commentId],
        );
        const comment = result.rows[0];

        return { "exists": comment ? true : false };
    }

    /** Searches by supplied commentId
     * returns single comment.
     * 
     * commentId => { id, username, postReferenceId, commentReferenceId,
     *                   createdAt, body}
     */

    static async getOne(commentId) {

        const result = await db.query(
            `SELECT id,
                    username,
                    post_reference_id as "postReferenceId",
                    comment_reference_id as "commentReferenceId",
                    created_at as "createdA",
                    body
             FROM Comments
             WHERE id = $1`,
            [commentId]
        );
        const comment = result.rows[0];

        return comment;
    }


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
    }


    /** Takes a referenceId, returns all comments related to that post.
     *      [ { id, username, postReferenceId, commentReferenceId, 
     *          createdAt, subject, body, comments }, ...]
     *  where comments is also 
     *      [ { id, username, postReferenceId, commentReferenceId, 
     *          createdAt, subject, body, comments }, ...] or null
     *   (recursive)
     * 
     *  assumes referenceId exists, please verify
     */

    static async getAllByReference(referenceId, type) {

        if (type !== "comment" || "post") throw new BadRequestError(`Invalid type:
                ${type} \nType must either be "comment" or "post"`);

        const otherType = type === "comment" ? "post" : "comment";

        const commentResult = await db.query(
            `SELECT id,
                    username,
                    created_at as "createdAt",
                    ${otherType}_reference_id as ${otherType}ReferenceId",
                    ${type}_reference_id as ${type}ReferenceId",
                    body
             FROM Comments
             WHERE ${type}_reference_id = $1`,
            [referenceId]
        );
        const supComments = commentResult.rows;

        if (supComments.length) {
            supComments.map((comment) => {
                const comments = await Comment.findByReference(comment.id, "comment");
                comment.comments = comments;
            });
        };
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
                      comment_reference_id AS "commenttReferenceId", 
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
    }


    /** Updates a comments body
     *
     * Returns { username, referenceId, body}
     *
     * Throws NotFoundError if not found.
     */

    static async update({ id, body, username }) {

        const check = await db.query(
            `SELECT id,
                    username
             FROM Comments
             WHERE id = $1`,
            [id],
        );

        if (check.rows[0].username !== username) throw new UnauthorizedError(`Unauthorized to change`)

        const result = await db.query(
            `UPDATE Comments 
             SET body = $1
             WHERE id = $2
             RETURNING id,
                  username, 
                  reference_id AS "referenceId", 
                  created_at AS "createdAt", 
                  body`,
            [body, id]
        );

        const comment = result.rows[0];

        if (!comment) throw new NotFoundError(`No comment with id: ${id}`);
        return comment;
    }



    /** Given a comment id, deletes that comment and returns undefined */

    static async remove(id) {
        let result = await db.query(
            `DELETE
             FROM Comments
             WHERE id = $1
             RETURNING id`,
            [id],
        );
        const comment = result.rows[0];

        if (!comment) throw new NotFoundError(`No comment with id: ${id}`);

    }


}
