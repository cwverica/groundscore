"use strict";

const db = require("../db");;
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/** Related functions for searches. */

class Search {


    /** Get search: returns the search object matching the provided ID
     * 
     * id => {id, title, username, locationId, closestOri, createdAt, userComments}
     */

    static async get(id) {

        const result = await db.query(
            `SELECT id,
                    title,
                    username,
                    location_id AS "locationId",
                    closest_ori AS "closestOri",
                    created_at AS "createdAt",
                    user_comments AS "userComments"
            FROM Saved_Searches
            WHERE id = $1`,
            [id],
        );

        const search = result.rows[0];

        return search;

    };


    /**
     * Get saved searches: takes a username and returns all of the searches
     * the user has saved.
     *  username => [{id, title, username, locationId, closestOri, createdAt, 
     *  userComments, lat, lng, county, state }, ...]
     */

    static async getAllByUser(username) {

        const result = await db.query(
            `SELECT s.id,
                    s.title,
                    s.username,
                    s.location_id AS "locationId",
                    s.closest_ori AS "closestOri",
                    s.created_at AS "createdAt",
                    s.user_comments AS "userComments",
                    l.lat,
                    l.lng,
                    l.county,
                    l.state
            FROM Saved_Searches as s
            INNER JOIN Locations as l
            ON s.location_id = l.id
            WHERE s.username = $1`,
            [username],
        );

        const searches = result.rows;

        return searches;
    };


    /** Save search: creates a new saved_search
     *   { username, title, locationId, closestori, userComments } => { id, title}.
     * 
     *  Be sure to verify that username exists
     *
     * - username: username that is saving the search
     * - locationId: the id of the location
     * - title: a brief title for the search
     * - closestori: ori of the closest reporting agency
     * - userComments: users comments about search results. (optional)
     **/

    static async save({ title, locationId, closestOri, username, userComments = '' }) {

        let result = await db.query(
            `SELECT id
             FROM Locations
             WHERE id = $1`,
            [locationId],
        );
        const location = result.rows[0];

        if (!location) throw new NotFoundError(`No location found with id: ${locationId}`);

        result = await db.query(
            `SELECT ori
             FROM Reporting_Agencies
             WHERE ori = $1`,
            [closestOri],
        );
        const ori = result.rows[0];

        if (!ori) throw new NotFoundError(`No agency found with ori: ${closestOri}`)

        let search = await db.query(
            `INSERT INTO Saved_Searches 
                (username, 
                 title,
                 location_id, 
                 closest_ori, 
                 user_comments)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, title`,
            [username, title, locationId, closestOri, userComments]);

        return search.rows[0];
    };


    /** Updates a search with 'data'
     * 
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include:
     *   { title, userComments }
     *
     * Returns { id, title, username, locationId, closestOri, createdAt, userComments}
     *
     * Throws NotFoundError if not found.
     *
     */

    static async update({ id, username, data }) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                userComments: "user_comments"
            });
        const idVarIdx = "$" + (values.length + 1);
        const userVarIdx = "$" + (values.length + 2)

        const querySql = `UPDATE Saved_Searches 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      AND username = $${userVarIdx}
                      RETURNING id,
                                title,
                                username, 
                                location_id AS "locationId",
                                closest_ori AS "closestOri", 
                                created_at AS "createdAt", 
                                user_comments AS "userComments"`;
        const result = await db.query(querySql, [...values, id, username]);
        const search = result.rows[0];

        if (!search) throw new NotFoundError(`No post with id: ${id} from user: ${username}`);

        return search;
    };


    /** Given an id, deletes that search and returns undefined */

    static async delete(id) {
        let result = await db.query(
            `DELETE
             FROM Saved_Searches
             WHERE id = $1
             RETURNING id`,
            [id],
        );
        const search = result.rows[0];

        if (!search) throw new NotFoundError(`No search with id: ${id}`);
    };

};


module.exports = Search;
