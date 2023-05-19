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

// /************************************** POST /jobs */

// describe("POST /jobs", function () {
//   const newJob = {
//     title: "newJob",
//     salary: 15,
//     equity: 0.9,
//     companyHandle: "c1",
//   };

//   test("ok for admin", async function () {
//     const resp = await request(app)
//       .post("/jobs")
//       .send(newJob)
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(201);
//     expect(resp.body).toEqual({
//       job: {
//         companyHandle: "c1",
//         equity: String(newJob.equity),
//         id: totalJobs + 1,
//         salary: 15,
//         title: "newJob",
//       },
//     });
//   });

//   test("fail for non-admin", async function () {
//     try {
//       const resp = await request(app)
//         .post("/jobs")
//         .send(newJob)
//         .set("authorization", `Bearer ${u1Token}`);
//     } catch (error) {
//       expect(error.message).toBe("Not an admin");
//     }
//   });

//   test("bad request with missing data (no companyHandle)", async function () {
//     const resp = await request(app)
//       .post("/jobs")
//       .send({
//         title: "newJob",
//         salary: 10,
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request with invalid data", async function () {
//     const resp = await request(app)
//       .post("/jobs")
//       .send({
//         ...newJob,
//         invalidData: "invalid data",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: job1Id,
          title: "job1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1",
        },
        {
          id: job2Id,
          title: "job2",
          salary: null,
          equity: null,
          companyHandle: "c2",
        },
        {
          id: job3Id,
          title: "job3",
          salary: 500000,
          equity: "0.999",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("search by job title", async function () {
    const resp = await request(app).get("/jobs?title=1");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: job1Id,
          title: "job1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("search by minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=100000");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: job1Id,
          title: "job1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1",
        },
        {
          id: job3Id,
          title: "job3",
          salary: 500000,
          equity: "0.999",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("search by hasEquity=true", async function () {
    const resp = await request(app).get("/jobs?hasEquity=true");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: job1Id,
          title: "job1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1",
        },
        {
          id: job3Id,
          title: "job3",
          salary: 500000,
          equity: "0.999",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("search by hasEquity=false", async function () {
    const resp = await request(app).get("/jobs?hasEquity=false");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: job1Id,
          title: "job1",
          salary: 100000,
          equity: "0.5",
          companyHandle: "c1",
        },
        {
          id: job2Id,
          title: "job2",
          salary: null,
          equity: null,
          companyHandle: "c2",
        },
        {
          id: job3Id,
          title: "job3",
          salary: 500000,
          equity: "0.999",
          companyHandle: "c3",
        },
      ],
    });
  });

  test("invalid: invalid query string", async function () {
    try {
      await request(app).get("/jobs?badquerystring=bad");
    } catch (error) {
      expect(error.message).toEqual(
        'instance is not allowed to have the additional property "badquerystring"'
      );
    }
  });
});

// /************************************** GET /jobs/:jobId */

// describe("GET /jobs/:jobId", function () {
//   test("works for anon", async function () {
//     const resp = await request(app).get(`/jobs/${job1Id}`);
//     expect(resp.body).toEqual({
//       job: {
//         id: job1Id,
//         title: "job1",
//         salary: 100000,
//         equity: "0.5",
//         companyHandle: "c1",
//       },
//     });
//   });

//   test("no job found", async function () {
//     const resp = await request(app).get(`/jobs/${totalJobs + 1}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

// /************************************** PATCH /jobs/:jobId */

// describe("PATCH /jobs/:jobId", function () {
//   test("works for admins", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/${job1Id}`)
//       .send({
//         salary: 200000,
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({
//       job: {
//         id: job1Id,
//         title: "job1",
//         salary: 200000,
//         equity: "0.5",
//         companyHandle: "c1",
//       },
//     });
//   });

//   test("fail for non-admins", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/${job1Id}`)
//       .send({
//         salary: 200000,
//       })
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app).patch(`/jobs/${job1Id}`).send({
//       salary: 200000,
//     });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such job", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/-1`)
//       .send({
//         salary: 200000,
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on jobId change attempt", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/${job1Id}`)
//       .send({
//         id: "newId",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/${job1Id}`)
//       .send({
//         badData: "badData",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /jobs/:jobId */

// describe("DELETE /jobs/:jobId", function () {
//   test("works for admins", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/${job1Id}`)
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({ deleted: `${job1Id}` });
//   });

//   test("fails for non-admin", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/${job1Id}`)
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app).delete(`/jobs/${job1Id}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such job", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/-1`)
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
