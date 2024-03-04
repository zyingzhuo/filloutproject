const express = require("express");
const utils = require("./utils");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Please ...");
});

app.get("/:formId/filteredResponses", async (req, res) => {
  const formId = req.params.formId;
  const queries = Object.assign({}, req.query);
  if (queries.filters) {
    delete queries.filters;
  }
  const filtersString = req.query["filters"];
  const filtersJason = filtersString ? JSON.parse(filtersString) : null;
  const filteredData = await utils.getFilteredFilloutFormResponses(
    formId,
    filtersJason,
    queries
  );

  res.send(filteredData);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
