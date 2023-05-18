"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 250000,
    equity: 0.098,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "new",
      salary: 250000,
      equity: "0.098",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 250000,
        equity: "0.098",
        companyHandle: "c1",
      },
    ]);
  });

  // test("fails with empty data", async function () {
  //   try {
  //     let job = await Job.create();
  //   } catch (error) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
});

/************************************** findAll */
//TODO: test Company.findAll() with filters | test that filter works

// describe("findAll", function () {
//   test("works: no filter", async function () {
//     let companies = await Company.findAll();
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });

//   test("works: with filter", async function () {
//     let query = { nameLike: "1", minEmployees: 1 };
//     let companies = await Company.findAll(query);
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     ]);
//   });
// });

// /************************************** search */

// describe("search", function () {
//   test("works", async function () {
//     let query = { nameLike: "1", minEmployees: 1 };
//     let filterQueries = await Company.search(query);
//     expect(filterQueries).toEqual({
//       whereSqlString: "name ILIKE '%' || $1 || '%' AND num_employees >= $2",
//       filterValues: ["1", 1],
//     });
//   });

//   test("empty query string returns false", async function () {
//     let filterQueries = await Company.search();
//     expect(filterQueries).toEqual(false);
//   });
// });

// /************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let company = await Company.get("c1");
//     expect(company).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.get("nope");
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let company = await Company.update("c1", updateData);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`
//     );
//     expect(result.rows).toEqual([
//       {
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: 10,
//         logo_url: "http://new.img",
//       },
//     ]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let company = await Company.update("c1", updateDataSetNulls);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`
//     );
//     expect(result.rows).toEqual([
//       {
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: null,
//         logo_url: null,
//       },
//     ]);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.update("nope", updateData);
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Company.update("c1", {});
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Company.remove("c1");
//     const res = await db.query(
//       "SELECT handle FROM companies WHERE handle='c1'"
//     );
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.remove("nope");
//       throw new Error("fail test, you shouldn't get here");
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
