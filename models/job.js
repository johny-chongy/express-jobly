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
    // console.log("job= ", job);

    return job;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filter) {
    //TODO: accept search return value (default {})
    const searchFilter =
      filter === undefined ? { whereSqlString: "" } : await Job.search(filter);
    const whereText = searchFilter.whereSqlString === "" ? "" : "WHERE ";
    console.log("searchFilter", searchFilter);
    const companiesRes = await db.query(
      `
        SELECT id,
               title,
               salary,
               equity,
               company_handle      AS "companyHandle"
        FROM jobs
        ${whereText + searchFilter.whereSqlString}
        ORDER BY id`,
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
    const hasEquity = queryStrings["hasEquity"] ? "equity IS NOT NULL" : "";
    console.log("hasEquity", hasEquity);

    for (let queryString in queryStrings) {
      filterValues.push(queryStrings[queryString]);
      if (queryString === "title") {
        whereClause.push(`title ILIKE '%' || $${filterValues.length} || '%'`);
      } else if (queryString === "minSalary") {
        whereClause.push(`salary >= $${filterValues.length} AND salary IS NOT NULL`);
      } else if (queryString === "hasEquity") {
        whereClause.push(hasEquity);
        filterValues.pop();
      }
    }

    let whereSqlString = whereClause.filter(clause => clause !== "").join(" AND ");
    console.log('wherestring', whereSqlString);

    return { whereSqlString, filterValues };
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(jobId) {
    if (isNaN(jobId)) {
      throw new BadRequestError("jobId should be a number");
    }

    const jobRes = await db.query(
      `
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`,
      [jobId]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${jobId}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(jobId, data) {
    if (isNaN(jobId)) {
      throw new BadRequestError("jobId should be a number");
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });
    const idVarIdx = "$" + (values.length + 1);
    const querySql = `
        UPDATE jobs
          SET ${setCols}
          WHERE id = ${idVarIdx}
          RETURNING
              id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"`;
    // console.log('querysql', querySql);
    const result = await db.query(querySql, [...values, jobId]);
    const job = result.rows[0];
    console.log("job", job);
    if (!job) throw new NotFoundError(`No job with id ${jobId}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(jobId) {
    if (isNaN(jobId)) {
      throw new BadRequestError("jobId should be a number");
    }

    const result = await db.query(
      `
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`,
      [jobId]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${jobId}`);
  }
}

module.exports = Job;
