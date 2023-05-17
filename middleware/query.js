"use strict";

/** Convenience middleware to handle query string cases in routes. */

const { BadRequestError } = require("../expressError");

/** Middleware: authenticate query string for numbers */

function authenticateQuery(req, res, next) {
  if (req.query) {
    const minEmployees = Number(req.query.minEmployees);
    const maxEmployees = Number(req.query.maxEmployees);
    const validQuery = ["nameLike", "minEmployees", "maxEmployees"];

    for (let queryString in req.query) {
      if (!validQuery.includes(queryString)) {
        throw new BadRequestError(
          `${queryString} is an invalid query string`
        )
      }
    }

    if (isNaN(minEmployees) && req.query.minEmployees) {
      throw new BadRequestError(
        "minEmployees and maxEmployees must be numbers"
      )
    }

    if (minEmployees && maxEmployees && minEmployees > maxEmployees) {
      throw new BadRequestError(
        "value for minEmployees should be equal to or less than maxEmployees"
      );
    }
  }

  return next();
}

module.exports = { authenticateQuery };