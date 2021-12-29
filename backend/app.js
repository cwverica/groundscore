"use strict";

/** Express app for GroundScore. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const commentRoutes = require("./routes/comments");
const crimeRoutes = require("./routes/crimes");
const locationRoutes = require("./routes/locations");
const postRoutes = require("./routes/posts");
const searchRoutes = require("./routes/searches");
const userRoutes = require("./routes/users");
const agencyRoutes = require("./routes/agencies");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

// will us differente routes, as such:
app.use("/auth", authRoutes);
app.use("/comments", commentRoutes);
app.use("/crimes", crimeRoutes);
app.use("/locations", locationRoutes);
app.use("/posts", postRoutes);
app.use("/searches", searchRoutes);
app.use("/users", userRoutes);
app.use("/agencies", agencyRoutes);



/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError(`Route not found`));
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;
