"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, checkAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * company should be { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */

router.post("/", checkAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }
  console.log("passed validator");

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  /** TODO: 1. make copy of req.query
   *  2. pass copy through JSON schema
   */
  let query = {};
  for (let queryString in req.query) {
    if (queryString === "nameLike") {
      query[queryString] = req.query.nameLike;
    } else {
      query[queryString] = Number(req.query[queryString]);
    }
  }

  const validator = jsonschema.validate(query, companySearchSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  if (
    query.minEmployees &&
    query.maxEmployees &&
    query.minEmployees > query.maxEmployees
  ) {
    throw new BadRequestError(
      "minEmployees should be equal to or less than maxEmployees"
    );
  }
  console.log("query", query);
  const companies = await Company.findAll(query);

  return res.json({ companies });
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:jobId", async function (req, res, next) {
  const job = await Job.get(req.params.jobId);
  return res.json({ job });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", checkAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, companyUpdateSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.update(req.params.handle, req.body);
  return res.json({ company });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", checkAdmin, async function (req, res, next) {
  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});

module.exports = router;
