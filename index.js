"use strict";
const joi = require("joi");
const { aql, db } = require("@arangodb");
const { context } = require("@arangodb/locals");
const createRouter = require("@arangodb/foxx/router");
const { getAuth } = require("./util");

/** @type {{ collections: string; username: string; password: string; }} */
const cfg = context.configuration;

const COLLECTIONS = cfg.collections.split(",").map(str => str.trim());
for (const collectionName of COLLECTIONS) {
  if (!db._collection(collectionName)) {
    throw new Error(
      `Invalid service configuration. Unknown collection: ${collectionName}`
    );
  }
}

const router = createRouter();
context.use(router);

router.use((req, res, next) => {
  const auth = getAuth(req);
  if (!auth || !auth.basic) {
    res.throw(401, "Authentication required");
  }
  const { username, password } = auth.basic;
  if (
    username !== cfg.username ||
    (cfg.password && password !== cfg.password)
  ) {
    res.throw(403, "Bad username or password");
  }
  next();
});

router
  .get("/", (_req, res) => {
    res.json(COLLECTIONS);
  })
  .response(joi.array().items(joi.string()), "List of collection names.")
  .summary("List the available collections")
  .description(
    "This endpoint returns the names of collections that can be queried."
  );

router
  .get("/:collection", (req, res) => {
    /** @type {{ collection: string; }} */
    const { collection: collectionName } = req.pathParams;
    const collection = db._collection(collectionName);
    /** @type {{ page: number; per_page: number; }} */
    const { page, per_page } = req.queryParams;
    const start = (page - 1) * per_page;

    const { query, bindVars } = aql`
      FOR doc IN ${collection}
      LIMIT ${start}, ${per_page}
      RETURN doc
    `;
    const result = db._query(query, bindVars, { fullCount: true });
    const { fullCount } = result.getExtra().stats;
    res.json({
      page,
      per_page,
      page_count: Math.ceil(fullCount / per_page),
      total_count: fullCount,
      records: result.toArray()
    });
  })
  .pathParam(
    "collection",
    joi.allow(...COLLECTIONS).required(),
    "Name of the collection to read data from."
  )
  .queryParam(
    "page",
    joi
      .number()
      .integer()
      .default(1)
      .optional(),
    "Page number, defaults to the first page."
  )
  .queryParam(
    "per_page",
    joi
      .number()
      .integer()
      .default(100)
      .optional(),
    "Number of documents to return per page, defaults to 100."
  )
  .response(
    joi.object().keys({
      page: joi.number().integer(),
      per_page: joi.number().integer(),
      page_count: joi.number().integer(),
      total_count: joi.number().integer(),
      records: joi.array().items(joi.object())
    }),
    "Paginated query results."
  )
  .summary("Pagination of documents of a given collection")
  .description("This route is delivering paginated documents of a collection.");
