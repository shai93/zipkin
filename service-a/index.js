const express = require("express");
const {
  Tracer,
  ExplicitContext,
  BatchRecorder,
  jsonEncoder: { JSON_V2 },
  sampler,
} = require("zipkin");
const { HttpLogger } = require("zipkin-transport-http");
const traceSampler = new sampler.CountingSampler(10); // 100% sampling rate
const zipkinMiddleware =
  require("zipkin-instrumentation-express").expressMiddleware;
const axios = require("axios");
const logger = require("./logger");

const app = express();

// Zipkin setup
const ctxImpl = new ExplicitContext();
const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: "http://localhost:9411/api/v2/spans",
    jsonEncoder: JSON_V2,
    errorLogger: (error) => console.error("Zipkin Error:", error), // Log errors
  }),
});
const tracer = new Tracer({ ctxImpl, recorder, localServiceName: "service-a", sampler: traceSampler});

app.use(zipkinMiddleware({ tracer }));

app.get("/api", (req, res) => {
  const traceId = req.headers["x-b3-traceid"];
  logger.info("Handling /api request", { traceId });
  res.send("Hello from Service A");
});

app.get("/call-service-b", (req, res) => {
const traceId = req.headers['x-b3-traceid'];
  logger.info('Calling Service B', { traceId });
  axios
    .get("http://localhost:3001/api", {
      headers: {
        "X-B3-TraceId": req.headers["x-b3-traceid"],
        "X-B3-SpanId": req.headers["x-b3-spanid"],
        "X-B3-ParentSpanId": req.headers["x-b3-parentspanid"],
        "X-B3-Sampled": req.headers["x-b3-sampled"],
        "X-B3-Flags": req.headers["x-b3-flags"],
      },
    })
    .then((response) => {
      logger.info('Received response from Service B', { traceId });
      res.send(response.data);
    })
    .catch((error) => {
      logger.error('Error calling Service B', { traceId, error });
      res.status(500).send(error.toString());
    });
});

app.listen(3000, () => {
  console.log("Service A listening on port 3000");
});
