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

/** Helps with filtering values from JS -> SQL
 *
 *  Inputs:
 *    dataToFilter: an object from the req.query (JSON) that contains
 *                        {nameLike: 'm', minEmployees: '100'}
 *
 *    jsToSql: an object that contains mappings between JS variables to
 *             SQL WHERE conditionals (if applicable)
 *                        {nameLike: "name ILIKE",
 *                         minEmployees: "num_employees >=",
 *                         maxEmployees: "num_employees <=",}
 * Outputs:
 *    {
 *        filterWhere: "name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3",
 *        values:["3m", 100, 1000]
 *    }
 *
 *    filterWhere: a string literal used to inject into SQL WHERE to filter
 *    values: an array of values-to-update to inject into SQL for filtering values
 *
 */
function sqlForFilter(dataToFilter, jsToSql) {
  const keys = Object.keys(dataToFilter);

  const whereConditionals = keys.map(
    (queryString, idx) => `${jsToSql[queryString] || queryString} $${idx + 1}`
  );

  //passing in SQL string pattern '%nameLike%'
  if (dataToFilter["nameLike"]) {
    dataToFilter["nameLike"] = `%${dataToFilter.nameLike}%`;
  }

  return {
    filterWhere: whereConditionals.join(" AND "),
    values: Object.values(dataToFilter),
  };
}

module.exports = { sqlForPartialUpdate, sqlForFilter };
