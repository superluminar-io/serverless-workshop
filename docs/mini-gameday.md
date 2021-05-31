# Mini GameDay

## In this lab …

- Learn more about the GameDay format
- Load testing the API
- Learn best practices and anti-patterns

## About GameDays

A GameDay is a fun way to simulate failure or unexpected events. The main goal is to practice those scenarios, learn how to react and improve the system over time so incidents can be avoided. Learn more about GameDays in the [AWS documentation](https://wa.aws.amazon.com/wellarchitected/2020-07-02T19-33-23/wat.concept.gameday.en.html).

## Scenario for today

Imagine our Notes API from the previous labs is ready for production. We launched our notes app and people start using and loving it. But, what happens if the app gets so popular, that we get high traffic or even traffic spikes. Does the API scale as serverless always promise?

## Load Testing

We want to simulate traffic spikes by sending HTTP requests to our API. Before we can start, we need to install [hey](https://github.com/rakyll/hey), a CLI we recommend to send HTTP requests. It's simple to use and available for all major operating systems.

Now that we have installed hey, we can use it to send requests:

```bash
hey -n 1000 https://XXXXXX.execute-api.eu-central-1.amazonaws.com/notes
```

You should get an output similiar to this one:

```bash
Summary:
  Total:	3.3467 secs
  Slowest:	1.4896 secs
  Fastest:	0.0298 secs
  Average:	0.1491 secs
  Requests/sec:	298.8035

  Total data:	73000 bytes
  Size/request:	73 bytes

Response time histogram:
  0.030 [1]	|
  0.176 [890]	|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.322 [40]	|■■
  0.468 [18]	|■
  0.614 [1]	|
  0.760 [0]	|
  0.906 [0]	|
  1.052 [0]	|
  1.198 [0]	|
  1.344 [3]	|
  1.490 [47]	|■■


Latency distribution:
  10% in 0.0453 secs
  25% in 0.0593 secs
  50% in 0.0661 secs
  75% in 0.0848 secs
  90% in 0.1978 secs
  95% in 1.2095 secs
  99% in 1.4562 secs

Details (average, fastest, slowest):
  DNS+dialup:	0.0062 secs, 0.0298 secs, 1.4896 secs
  DNS-lookup:	0.0008 secs, 0.0000 secs, 0.0161 secs
  req write:	0.0000 secs, 0.0000 secs, 0.0003 secs
  resp wait:	0.1428 secs, 0.0297 secs, 1.3839 secs
  resp read:	0.0001 secs, 0.0000 secs, 0.0012 secs

Status code distribution:
  [200]	1000 responses
```

As you can see, we sent 1000 requests and always got back the HTTP status code 200. The API could handle the traffic. But what happens if you execute the command multiple times?

More questions for your investigation:

- What causes the problem?
- How can you identify the problem in the AWS console?
- How could we improve the API to deal with traffic spikes?
