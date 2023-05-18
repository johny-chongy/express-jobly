"use strict";

const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `
        SELECT handle
        FROM companies
        WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filter) {
    //TODO: accept search return value (default {})
    const searchFilter = filter === undefined
                            ? {whereSqlString: ""}
                            : await Company.search(filter);
    const whereText = searchFilter.whereSqlString === ""
                            ? ""
                            : "WHERE ";
    console.log("searchFilter", searchFilter);
    const companiesRes = await db.query(
      `
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ${whereText + searchFilter.whereSqlString}
        ORDER BY name`,
      searchFilter.filterValues
    );

    return companiesRes.rows;
  }

  /** Search companies
   * Takes either nameLike, minEmployees, or maxEmployees
   * Returns an array of companies that meets the condition(s)
   * e.g., [{ handle, name, description, numEmployees, logoUrl }, ...]
   */

  static async search(queryStrings) {
    //TODO: return filter WHERE and values to findAll() -> conditional on "" -> just findAll()
    //TODO: use whereClause.length for $ injection value (push into values first -> generate whereClause string)

    if (!queryStrings) {
      return false;
    }

    const whereClause = []; // array of strings
    const filterValues = []; // array of values to filter on

    for (let queryString in queryStrings) {
      filterValues.push(queryStrings[queryString]);
      if (queryString === "nameLike") {
        whereClause.push(`name ILIKE '%' || $${filterValues.length} || '%'`);
      } else if (queryString === "minEmployees") {
        whereClause.push(`num_employees >= $${filterValues.length}`);
      } else if (queryString === "maxEmployees") {
        whereClause.push(`num_employees <= $${filterValues.length}`);
      }
    }

    let whereSqlString = whereClause.join(" AND ");

    return { whereSqlString, filterValues };
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
