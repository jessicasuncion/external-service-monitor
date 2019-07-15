const express = require('express');
const logger = require('morgan');
const https = require('https');
const cors = require('cors')
const manageExternalServices = require('./routes/services');

const port = 8080;
const corsHeaders = ["Link"];

let app = express();
app.server = https.createServer(app);

// logger
app.use(logger('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: corsHeaders
}));

// ROUTES
app.use('/', manageExternalServices());

app.listen(port, () =>
  console.log(`Listening on port ${port}!`),
);

module.exports = app;
