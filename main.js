'use strict';

// modules
const aql = require('@arangodb').aql;
const db = require('@arangodb').db;
const joi = require('joi');

const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);

router.get('/documents', function (req, res) {
  // will only work with authentication
  // use basic auth
  if (!req.arangoUser) {
    res.throw('unauthorized');
  }

  // query params available here: req.queryParams);
  let result = {};

  let start = req.queryParams.start;
  let count = req.queryParams.count;

  if (Number.isInteger(start) && Number.isInteger(count)) {
    // returns a subset of all documents using limit
    try {
      result = db._query(`
        FOR x IN ${req.queryParams.collection} LIMIT ${start}, ${count} RETURN x
      `, null, null, {fullCount: true});
    } catch (e) {
      res.throw('bad request', e.message, {cause: e});
    }
  } else {
    // set start and count params to default values
    start = 0;
    count = 100;

    try {
      result = db._query(`
        FOR x IN ${req.queryParams.collection} LIMIT ${start}, ${count} RETURN x
      `, null, null, {fullCount: true});
    } catch (e) {
      res.throw('bad request', e.message, {cause: e});
    }
  }
  res.send(JSON.stringify({
    page: start,
    per_page: count,
    total: result._extra.stats.fullCount,
    total_pages: result._extra.stats.fullCount / count,
    data: result._documents
  }));
})
.queryParam('collection', joi.string().required())
.queryParam('start', joi.number().optional())
.queryParam('count', joi.number().optional())
.response(['text/json'], 'Object of documents and statistics.')
.summary('Pagination of documents of a given collection')
.description('This route is delivering paginated documents of a collection. If start and count are not defined, all documents will be returned.');
