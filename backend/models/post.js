"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

class Post {

    /** Searches by a supplied username, return all matching posts 
     *  [{id, username, locationId, createdAt, subject, body}, ...]
     * Assumes username exists in database, please verify first.
    */

    static async findByUser(username) {
        const result = await db.query(
            `SELECT id,
                    username,
                    location_id as "locationId",
                    created_at as "createdA"',
                    subject,
                    body
             FROM Posts
             WHERE username = $1`,
            [username]
        );

        const postList = result.rows;

        return postList;
    }


    /** Takes a locationId, returns all posts related to that location.
     *  [{id, username, locationId, createdAt, subject, body}, ...]
     */

    static async findByLocation(locationId) {
        const result = await db.query(
            `SELECT id,
                    username,
                    location_id as "locationId",
                    created_at as "createdAt",
                    subject,
                    body
             FROM Posts
             WHERE location_id = $1`,
            [locationId]
        );

        const postList = result.rows;

        return postList;
    }


    //TODO:
    // static async findRelated()
    //      Figure out relationship so that when a location is searched
    //      It can find related posts to bring up.



    /** Creates a new post from a given username, locationId, body, and (optional) subject
     * 
     * This assumes that the username and locationId have been verified.
     * Please verify that they all exist before using
     * 
     * Returns the newly created Post object.
     */

    static async createPost(username, locationId, body, subject = null) {

        const result = await db.query(
            `INSERT INTO Posts
                (username,
                 location_id,
                 subject,
                 body)
            VALUES ($1, $2, $3, $4)
            RETURNING id,
                      username, 
                      location_id AS "locationId", 
                      created_at AS "createdAt", 
                      subject, 
                      body`,
            [
                username,
                locationId,
                body,
                subject
            ],
        );

        const newPost = result.rows[0];

        return newPost;

    }


    /** Updates a post with 'data'
     * 
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include:
     *   { body, subject }
     *
     * Returns { username, locationId, body, subject}
     *
     * Throws NotFoundError if not found.
     *
     */

    static async updatePost(id, data) {

        const { setCols, values } = sqlForPartialUpdate(data, {});
        const postIdVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE Posts 
                      SET ${setCols} 
                      WHERE id = ${postIdVarIdx} 
                      RETURNING id,
                                username, 
                                location_id AS "locationId", 
                                created_at AS "createdAt", 
                                subject, 
                                body`;
        const result = await db.query(querySql, [...values, id]);
        const post = result.rows[0];

        if (!post) throw new NotFoundError(`No post with id: ${id}`);

        return post;
    }


    /** Given a post id, deletes that post and returns undefined */

    static async deletePost(id) {
        let result = await db.query(
            `DELETE
             FROM Posts
             WHERE id = $1
             RETURNING id`,
            [id],
        );
        const post = result.rows[0];

        if (!post) throw new NotFoundError(`No post with id: ${id}`);

    }


}

module.exports = Post;