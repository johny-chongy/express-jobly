"use strict";

const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `
                INSERT INTO jobs (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];
    console.log("job= ", job);

    return job;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filter) {
    //TODO: accept search return value (default {})
    const searchFilter =
      filter === undefined ? { whereSqlString: "" } : await job.search(filter);
    const whereText = searchFilter.whereSqlString === "" ? "" : "WHERE ";
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

  /** Given a job handle, return data about job.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, jobHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const jobRes = await db.query(
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

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);

    return job;
  }

  /** Update job data with `data`.
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
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
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
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);
  }
}

module.exports = Job;
