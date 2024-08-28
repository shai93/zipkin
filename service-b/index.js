const express = require('express');
const {Tracer, ExplicitContext, BatchRecorder, jsonEncoder: {JSON_V2}} = require('zipkin');
const {HttpLogger} = require('zipkin-transport-http');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

const app = express();

// Zipkin setup
const ctxImpl = new ExplicitContext();
const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: 'http://localhost:9411/api/v2/spans',
    jsonEncoder: JSON_V2,
    errorLogger: (error) => console.error('Zipkin Error:', error) // Log errors
  })
});
const tracer = new Tracer({ctxImpl, recorder, localServiceName: 'service-b'});

app.use(zipkinMiddleware({tracer}));

app.get('/api', (req, res) => {
  res.send('Hello from Service B');
});

app.listen(3001, () => {
  console.log('Service B listening on port 3001');
});
