"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev-key";

const PORT = +process.env.PORT || 3001;

const PSQL_STRING = process.env.PSQL_STRING || null;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
    if (PSQL_STRING) {
        return (PSQL_STRING + ((process.env.NODE_ENV === "test")
            ? "groundscore_test"
            : process.env.DATABASE_URL || "groundscore")
        )
    }
    return (process.env.NODE_ENV === "test")
        ? "groundscore_test"
        : process.env.DATABASE_URL || "groundscore";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 13;

console.log("GroundScore Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri().slice(-11));
console.log("---");

module.exports = {
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    getDatabaseUri,
};
