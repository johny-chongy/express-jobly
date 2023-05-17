"use strict";

const { sqlForPartialUpdate } = require("./sql");
const jsToSql = {
                  firstName: "first_name",
                  lastName: "last_name",
                  isAdmin: "is_admin",
                };

describe("sqlForPartialUpdate", function () {
  test("works: successful partial update", function () {
    const data = {firstName:"updateFirstName", email:"updateEmail"};
    const partialUpdate = sqlForPartialUpdate(data, jsToSql);

    expect(partialUpdate).toEqual({
      setCols: `"first_name"=$1, "email"=$2`,
      values: ["updateFirstName", "updateEmail"]
    });
  });

  test("fail: empty body data", function () {
    const data = {};
    expect.assertions(1);
    try {
      sqlForPartialUpdate(data,jsToSql);
    } catch (error) {
      expect(error.message).toBe("No data");
    }
  });

});