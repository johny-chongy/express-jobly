"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use when they must be an Admin
 *
 * If not, raises Unauthorized.
 */

function checkAdmin(req, res, next) {
  const user = res.locals.user;
  if (!user?.username || user?.isAdmin == false) {
    throw new UnauthorizedError("Not an admin");
  }

  return next();
}
/** Middleware to ensure the current user is either an admin or the user trying to access
 *
 * If not, raises Unauthorized.
 */

function checkAdminOrCorrectUser(req, res, next) {
  const user = res.locals.user;

  if (user.isAdmin == true && user || user.username === req.params.username && user) {
    return next();
  }

  throw new UnauthorizedError("Not an admin or the correct user");
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  checkAdmin,
  checkAdminOrCorrectUser,
};
