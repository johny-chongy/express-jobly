"use strict";

const { authenticateQuery } = require("./query");

describe("authenticateQuery", function () {
  test("fail: invalid query string", function () {
    const req = { query: { badQueryString: "hello" } };
    try {
      authenticateQuery(req);
    } catch (error) {
      expect(error.message).toEqual(
        "badQueryString is an invalid query string"
      );
    }
  });

  test("fail: minEmployees or maxEmployees not a number", function () {
    const req = { query: { minEmployees: "string", maxEmployees: 600 } };
    try {
      authenticateQuery(req);
    } catch (error) {
      expect(error.message).toEqual(
        "minEmployees and maxEmployees must be numbers"
      );
    }
  });

  test("fail: minEmployees greater than maxEmployees", function () {
    const req = { query: { minEmployees: 1000, maxEmployees: 600 } };
    try {
      authenticateQuery(req);
    } catch (error) {
      expect(error.message).toEqual(
        "minEmployees should be equal to or less than maxEmployees"
      );
    }
  });
});
