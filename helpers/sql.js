"use strict";

const { BadRequestError } = require("../expressError");

/** Helps with updating values from JS -> SQL
 *
 *  Inputs:
 *    dataToUpdate: an object from the req.body (JSON) that contains
 *                        {firstName: 'Aliya', email: 'newemail@.com}
 *
 *    jsToSql: an object that contains mappings between JS variables to
 *             SQL db column names (if applicable)
 *                        {firstName: "first_name", lastName: "last_name", ...}
 * Outputs:
 *    {setCols:`"first_name=$1", "email=$2"`, values:["newFirstName", "newEmail"]}
 *
 *    setCols: a string literal used to inject into SQL query to update database
 *    values: an array of values-to-update to inject into SQL query for updating
 *
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data"); //empty body
  // keys: [firstName: 'Aliya', email: 'newEmail@a.com]

  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );
  // cols: [`"first_name"=$1`, `"email"=$2`]

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
  // {setCols:`"first_name"=$1, "email"=$2`, values:["Aliya", "newEmail@a.com"]}
}


module.exports = { sqlForPartialUpdate };
