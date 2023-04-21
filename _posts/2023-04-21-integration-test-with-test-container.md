---
title: "用Test Container做 Integration Test"
create_time: 2023-04-21 10:19
tags:
- tech
- practice
---
### Integration Test

Integration test is to test whether many separately developed modules work together as expected.
> ![Image]({{ site.url }}/images/post_images/2023-04-21-integration-test-with-test-container/1.png)

#### narrow integration tests
-   exercise only that portion of the code in my service that talks to a separate service
-   uses test doubles of those services, either in process or remote
-   thus consist of many narrowly scoped tests, often no larger in scope than a unit test (and usually run with the same test framework that's used for unit tests)

> narrow integration tests are limited in scope, they often run very fast, so can run in early stages of a DeploymentPipeline, providing faster feedback should they go red.

#### broad integration tests
-   require live versions of all services, requiring substantial test environment and network access
-   exercise code paths through all services, not just code responsible for interactions

#### Why
-   run integration test as earlier as possible
-   practical and executable for every developers
-   environment isolation ↔︎ limited in scope
-   improve quality
-   improve effeciency

### Container Test
https://www.testcontainers.org/
Test container allows you to combine the benefits of unit test with the benefits of containerization. It starts containers for you to run your Integration tests as a Unit Test.

> ![Image]({{ site.url }}/images/post_images/2023-04-21-integration-test-with-test-container/2.png)

#### What does it do
1.  start a container
2.  init test case data
3.  start service
4.  run junit
5.  assert

#### Furthermore
- Cover snapshot test
- Cover regression test
