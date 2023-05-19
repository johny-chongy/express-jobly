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
let job1Id;
let job2Id;
let job3Id;

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
beforeEach(async function () {
  const result = await db.query(`SELECT id FROM jobs`);
  const ids = result.rows.map((obj) => obj.id);
  job1Id = ids[0];
  job2Id = ids[1];
  job3Id = ids[2];
});

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

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(job1Id);
    expect(job).toEqual({
      id: job1Id,
      title: "j1",
      salary: 100000,
      equity: "0.01",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(-1);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such job (jobId not a number)", async function () {
    try {
      await Job.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 20,
    equity: 0.99,
  };

  test("works", async function () {
    let job = await Job.update(job1Id, updateData);
    console.log("updated", job);
    expect(job).toEqual({
      id: job1Id,
      title: "New",
      salary: 20,
      equity: "0.99",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${job1Id}`
    );
    expect(result.rows).toEqual([
      {
        id: job1Id,
        title: "New",
        salary: 20,
        equity: "0.99",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    let job = await Job.update(job1Id, updateDataSetNulls);
    expect(job).toEqual({
      id: job1Id,
      title: "New",
      salary: null,
      equity: null,
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${job1Id}`
    );
    expect(result.rows).toEqual([
      {
        id: job1Id,
        title: "New",
        salary: null,
        equity: null,
        companyHandle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(-1, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(job1Id, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no such job (jobId not a number)", async function () {
    try {
      await Job.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(job1Id);
    const res = await db.query(`SELECT id FROM jobs WHERE id=${job1Id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(-1);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such job (jobId not a number)", async function () {
    try {
      await Job.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
