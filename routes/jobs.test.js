"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");
let job1Id;
let job2Id;
let job3Id;
let totalJobs;

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
beforeEach(async function () {
  const result = await db.query(`SELECT id FROM jobs`);
  const ids = result.rows.map((obj) => obj.id);
  job1Id = ids[0];
  job2Id = ids[1];
  job3Id = ids[2];
  totalJobs = ids[2];
});

afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "newJob",
    salary: 15,
    equity: 0.9,
    companyHandle: 'c1'
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        companyHandle: 'c1',
        equity: String(newJob.equity),
        id: totalJobs + 1,
        salary: 15,
        title: "newJob"
      },
    });
  });

  test("fail for non-admin", async function () {
    try {
      const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    } catch (error) {
      expect(error.message).toBe("Not an admin");
    }
  });

  test("bad request with missing data (no companyHandle)", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "newJob",
        salary: 10,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        invalidData: "invalid data",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** GET /jobs */

// describe("GET /companies", function () {
//   test("ok for anon", async function () {
//     const resp = await request(app).get("/companies");
//     expect(resp.body).toEqual({
//       companies: [
//         {
//           handle: "c1",
//           name: "C1",
//           description: "Desc1",
//           numEmployees: 1,
//           logoUrl: "http://c1.img",
//         },
//         {
//           handle: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         },
//         {
//           handle: "c3",
//           name: "C3",
//           description: "Desc3",
//           numEmployees: 3,
//           logoUrl: "http://c3.img",
//         },
//       ],
//     });
//   });

//   test("search by company name", async function () {
//     const resp = await request(app).get("/companies?nameLike=1");
//     expect(resp.body).toEqual({
//       companies: [
//         {
//           handle: "c1",
//           name: "C1",
//           description: "Desc1",
//           numEmployees: 1,
//           logoUrl: "http://c1.img",
//         },
//       ],
//     });
//   });

//   test("search by minEmployee and maxEmployees", async function () {
//     const resp = await request(app).get(
//       "/companies?minEmployees=2&maxEmployees=3"
//     );
//     expect(resp.body).toEqual({
//       companies: [
//         {
//           handle: "c2",
//           name: "C2",
//           numEmployees: 2,
//           description: "Desc2",
//           logoUrl: "http://c2.img",
//         },
//         {
//           handle: "c3",
//           name: "C3",
//           numEmployees: 3,
//           description: "Desc3",
//           logoUrl: "http://c3.img",
//         },
//       ],
//     });
//   });

//   test("invalid: search by minEmployee higher than maxEmployees", async function () {
//     try {
//       await request(app).get("/companies?minEmployees=2&maxEmployees=1");
//     } catch (error) {
//       expect(error.message).toEqual(
//         "minEmployees should be equal to or less than maxEmployees"
//       );
//     }
//   });

//   test("invalid: invalid query string", async function () {
//     try {
//       await request(app).get("/companies?badquerystring=bad");
//     } catch (error) {
//       expect(error.message).toEqual(
//         'instance is not allowed to have the additional property "badquerystring"'
//       );
//     }
//   });
// });

/************************************** GET /jobs/:jobId */

describe("GET /jobs/:jobId", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${job1Id}`);
    expect(resp.body).toEqual({
      job: {
        id: job1Id,
        title: "job1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
    });
  });

  test("no job found", async function () {
    const resp = await request(app).get(`/jobs/${totalJobs+1}`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /companies/:handle */

// describe("PATCH /companies/:handle", function () {
//   test("works for admins", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("fail for non-admins", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app).patch(`/companies/c1`).send({
//       name: "C1-new",
//     });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such company", async function () {
//     const resp = await request(app)
//       .patch(`/companies/nope`)
//       .send({
//         name: "new nope",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         handle: "c1-new",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         logoUrl: "not-a-url",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /companies/:handle */

// describe("DELETE /companies/:handle", function () {
//   test("works for admins", async function () {
//     const resp = await request(app)
//       .delete(`/companies/c1`)
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("fails for non-admin", async function () {
//     const resp = await request(app)
//       .delete(`/companies/c1`)
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app).delete(`/companies/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such company", async function () {
//     const resp = await request(app)
//       .delete(`/companies/nope`)
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
