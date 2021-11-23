"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

class Comment {

    /** Searches by a supplied username, return all matching comments 
     *  [{id, username, referenceId, createdAt, subject, body}, ...]
     * Assumes username exists in database, please verify first.
    */

    static async findByUser(username) {
        const result = await db.query(
            `SELECT id,
                    username,
                    reference_id as "referenceId",
                    created_at as "createdA",
                    body
             FROM Comments
             WHERE username = $1`,
            [username]
        );

        return result.rows;
    }


    /** Takes a referenceId, returns all posts related to that location.
     *  [{id, username, referenceId, createdAt, subject, body}, ...]
     */

    static async findByPost(referenceId) {
        const result = await db.query(
            `SELECT id,
                    username,
                    reference_id as "referenceId",
                    created_at as "createdAt",
                    body
             FROM Posts
             WHERE location_id = $1`,
            [referenceId]
        )
    }


    /** Creates a new comment from a given username, refereneceId, and body
         * 
         * This assumes that the username and referenceId have been verified.
         * Please verify that they all exist before using
         * 
         * Returns the newly created Comment object.
         */

    static async createComment(username, referenceId, body) {

        const result = await db.query(
            `INSERT INTO Posts
                (username,
                 reference_id,
                 body)
            VALUES ($1, $2, $3, $4)
            RETURNING id,
                      username, 
                      reference_id AS "referenceId", 
                      created_at AS "createdAt", 
                      body`,
            [
                username,
                referenceId,
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
    static async updateComment(id, body) {

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



    /** Given a comment id, deletes that ccomment and returns undefined */

    static async deleteComment(id) {
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
