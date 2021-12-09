"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {

    /** Check to see if user exists.
     * 
     * Returns true if user exists, otherwise false
     */

    static async exists(username) {
        const check = await db.query(
            `SELECT username
             FROM Users
             WHERE username = $1`,
            [username],
        );

        if (check.rows[0]) return true;
        else return false;
    }


    /** authenticate user with username, password.
     *
     * Returns { username, first_name, last_name, email, is_admin }
     *
     * Throws UnauthorizedError is user not found or wrong password.
     **/

    static async authenticate(username, password) {
        // try to find the user first
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    email_verified as "emailVerified",
                    is_admin AS "isAdmin"
           FROM Users
           WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {
            // compare hashed password to a new hash from password
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }
        return { failed: true, Error: new UnauthorizedError("Invalid username/password") }

    }


    /** Register user with data.
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws BadRequestError on duplicates.
     **/

    static async register(
        { username, password, firstName, lastName, email, isAdmin }) {
        const duplicateCheck = await db.query(
            `SELECT username
             FROM Users
             WHERE username = $1`,
            [username],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO Users
               (username,
                password,
                first_name,
                last_name,
                email,
                is_admin)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
            [
                username,
                hashedPassword,
                firstName,
                lastName,
                email,
                isAdmin,
            ],
        );

        const user = result.rows[0];

        return user;
    }


    /** Find all users.
     *
     * Returns an array of user objects of form
     * [{ username, first_name, last_name, email, is_admin }, ...]
     **/

    static async findAll() {
        const result = await db.query(
            `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
             FROM Users
             ORDER BY username`,
        );

        return result.rows;
    }


    /** Given a username, return data about user.
     * 
     * Returns { username, first_name, last_name, is_admin, searches, posts, comments }
     *   where searches is [{ searchId, locationId, closestORI, comments }, ...]
     *        and posts is [{ postId, locationId, createdAt, subject (optional), body}, ...]
     *     and comments is [{ commentId, referenceId, createdAt, body}, ...]
     *
     * Throws NotFoundError if user not found.
     * 
     * TODO: Should this endpoint return all of this, or just user data
     **/

    static async get(username) {
        const userRes = await db.query(
            `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
             FROM Users
             WHERE username = $1`,
            [username]
        );
        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        const savedSearchesRes = await db.query(
            `SELECT s.id as "searchId",
                    s.location_id AS "locationId",
                    s.closest_ori AS "closestORI",
                    s.comments
             FROM Saved_Searches as s
             WHERE s.username = $1`,
            [username]
        );
        user.searches = savedSearchesRes.rows;

        const postsRes = await db.query(
            `SELECT p.id as "postId",
                    p.location_id as "locationId",
                    p.created_at as "createdAt",
                    p.subject,
                    p.body
             FROM Posts as p
             WHERE p.username = $1`,
            [username]);
        user.posts = postsRes.rows;

        const commentsRes = await db.query(
            `SELECT c.id as "postId",
                    c.reference_id as "referenceId",
                    c.created_at as "createdAt",
                    c.body
             FROM Comments as c
             WHERE c.username = $1`,
            [username]
        );
        user.comments = commentsRes.rows;

        return user;
    }


    /** Update user data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include:
     *   { username, firstName, lastName, password, email }
     *
     * Returns { id, username, firstName, lastName, email, isAdmin }
     *
     * Throws NotFoundError if not found.
     *
     * WARNING: this function can set a new password or make a user an admin.
     * Callers of this function must be certain they have validated inputs to this
     * or a serious security risks are opened.
     */

    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }
        if (data.email) {
            data.emailVerified = false;
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name",
                emailVerified: "email_verified"
            });
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE Users 
                            SET ${setCols} 
                            WHERE username = ${usernameVarIdx} 
                            RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    }


    /** Delete given user from database; returns undefined. */

    static async delete(username) {
        let result = await db.query(
            `DELETE
             FROM Users
             WHERE username = $1
             RETURNING username`,
            [username],
        );
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
    }
}


module.exports = User;
