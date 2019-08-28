const should = require('should')
const getLogs = require('../lib/getLogs')

describe('getLogs', () => {
  const testEvent = {
    messageType: 'DATA_MESSAGE',
    owner: '000000000000',
    logGroup: '/aws/lambda/test-log-group',
    logStream: 'test-log-stream',
    subscriptionFilters: [ 'test-filter' ],
    logEvents: [
      {
        id: '01234567890123456789012345678901234567890123456789012345',
        timestamp: 1484275477103,
        message:
          '{"http_user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36","real_ip":"8.8.8.8"}'
      },
      {
        id: '12345678901234567890123456789012345678901234567890123456',
        timestamp: 1484275477113,
        message: '[ERROR] Example error message.'
      } ]
  }

  it('should work as expected', () => {
    const logs = getLogs(testEvent)
    should(logs).length(2)
    should(logs[0]).have.property('@timestamp')
    should(logs[0]).have.property('real_ip', '8.8.8.8')
    should(logs[0]).have.property('logGroup', '/aws/lambda/test-log-group')
    should(logs[0]).have.property('functionName', 'test-log-group')
    should(logs[1]).have.property('@timestamp')
    should(logs[1]).have.property('message', testEvent.logEvents[1].message)
    should(logs[1]).have.property('logGroup', '/aws/lambda/test-log-group')
    should(logs[1]).have.property('functionName', 'test-log-group')
  })

  describe('of node.js json output', () => {
    const testEvent = {
      messageType: 'DATA_MESSAGE',
      owner: '000000000000',
      logGroup: 'test-log-group',
      logStream: 'test-log-stream',
      subscriptionFilters: [ 'test-filter' ],
      logEvents: [
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message:
            // eslint-disable-next-line no-tabs
            `2019-04-05T13:30:48.634Z	00dc790e-2a09-4d3d-97f9-8d7d81dd231f	ERROR	Unhandled Promise Rejection
{
    "errorType": "Runtime.UnhandledPromiseRejection",
    "errorMessage": "TypeError: Cannot read property 'claims' of undefined",
    "stack": [
        "Runtime.UnhandledPromiseRejection: TypeError: Cannot read property 'claims' of undefined",
        "    at process.on (/var/runtime/index.js:29:13)",
        "    at process.emit (events.js:198:13)",
        "    at process.EventEmitter.emit (domain.js:448:20)",
        "    at emitPromiseRejectionWarnings (internal/process/promises.js:119:20)",
        "    at process._tickCallback (internal/process/next_tick.js:69:34)"
    ],
    "reason": {
        "errorType": "TypeError",
        "errorMessage": "Cannot read property 'claims' of undefined",
        "stack": [
            "TypeError: Cannot read property 'claims' of undefined",
            "    at Object.<anonymous> (/var/task/lib/enhanceResponse.js:113:52)",
            "    at hookIterator (/var/task/node_modules/fastify/lib/hooks.js:124:10)",
            "    at next (/var/task/node_modules/fastify/lib/hooks.js:70:20)",
            "    at handleResolve (/var/task/node_modules/fastify/lib/hooks.js:77:5)",
            "    at process._tickCallback (internal/process/next_tick.js:68:7)"
        ]
    },
    "promise": {}
}`
        },
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message:
            // eslint-disable-next-line no-tabs
            `2019-04-05T13:30:48.634Z	00dc790e-2a09-4d3d-97f9-8d7d81dd231e
{
    "message": "dev | user 3a511eb7-8927-4941-abe8-fa09d0036db7 called GET /api/echo",
    "environment": "dev",
    "userId": "3a511eb7-8927-4941-abe8-fa09d0036db7",
    "method": "GET",
    "url": "/api/echo",
    "origin": "http://localhost:9000/cognito-test.html",
    "sourceIp": "83.73.226.2",
    "country": "CH",
    "x-amzn-trace-id": "Root=1-5ca75888-20aa791a9984ce2670ad9bc6"
}`
        },
        {
          id: '01234567890123456789012345678901234567890123456789012346',
          timestamp: 1484275477104,
          message:
            // eslint-disable-next-line no-tabs
            `2019-04-05T13:30:48.635Z	00dc790e-2a09-4d3d-97f9-8d7d81dd231e
{
    "message": "dev | user 3a511eb7-8927-4941-abe8-fa09d0036db7 called GET /api/echo",
    "environment": "dev",
    "userId": "3a511eb7-8927-4941-abe8-fa09d0036db7",
    "method": "GET",
    "url": "/api/echo",
    "origin": "http://localhost:9000/cognito-test.html",
    "sourceIp": "83.73.226.2",
    "country": "CH",
    "x-amzn-trace-id": "Root=1-5ca75888-20aa791a9984ce2670ad9bc6"
}`
        } ]
    }

    it('should work as expected', () => {
      const logs = getLogs(testEvent)
      should(logs).length(3)
      should(logs[0]).have.property('requestId', '00dc790e-2a09-4d3d-97f9-8d7d81dd231f')
      should(logs[0]).have.property('message', 'Unhandled Promise Rejection')
      should(logs[0]).have.property('errorMessage', 'TypeError: Cannot read property \'claims\' of undefined')
      should(logs[0]).have.property('errorType', 'Runtime.UnhandledPromiseRejection')
      should(logs[1]).have.property('requestId', '00dc790e-2a09-4d3d-97f9-8d7d81dd231e')
      should(logs[1]).have.property('message', 'dev | user 3a511eb7-8927-4941-abe8-fa09d0036db7 called GET /api/echo')
      should(logs[1]).have.property('sourceIp', '83.73.226.2')
      should(logs[2]).have.property('requestId', '00dc790e-2a09-4d3d-97f9-8d7d81dd231e')
      should(logs[2]).have.property('message', 'dev | user 3a511eb7-8927-4941-abe8-fa09d0036db7 called GET /api/echo')
      should(logs[2]).have.property('sourceIp', '83.73.226.2')
    })
  })

  describe('of node.js non json output', () => {
    const testEvent = {
      messageType: 'DATA_MESSAGE',
      owner: '000000000000',
      logGroup: 'test-log-group',
      logStream: 'test-log-stream',
      subscriptionFilters: [ 'test-filter' ],
      logEvents: [
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          // eslint-disable-next-line no-tabs
          message: '2019-04-05T12:55:41.511Z	187d6e46-a992-442f-865a-2cd194c7297e	calling action incrementModifications...'
        },
        {
          id: '01234567890123456789012345678901234567890123456789012346',
          timestamp: 1484275477104,
          // eslint-disable-next-line no-tabs
          message: '2019-04-05T12:55:41.512Z	187d6e46-a992-442f-865a-2cd194c7297f	INFO	this is from node 10 runtime...'
        },
        {
          id: '01234567890123456789012345678901234567890123456789012347',
          timestamp: 1484275477105,
          // eslint-disable-next-line no-tabs
          message: '2019-04-05T12:55:41.513Z	187d6e46-a992-442f-865a-2cd194c7297d	ERROR	this is from node 10 runtime too...'
        }
      ]
    }

    it('should work as expected', () => {
      const logs = getLogs(testEvent)
      should(logs).length(3)
      should(logs[0]).have.property('@timestamp')
      should(logs[0]).have.property('requestId', '187d6e46-a992-442f-865a-2cd194c7297e')
      should(logs[0]).have.property('message', 'calling action incrementModifications...')
      should(logs[1]).have.property('@timestamp')
      should(logs[1]).have.property('requestId', '187d6e46-a992-442f-865a-2cd194c7297f')
      should(logs[1]).have.property('message', 'this is from node 10 runtime...')
      should(logs[1]).have.property('level', 'INFO')
      should(logs[2]).have.property('@timestamp')
      should(logs[2]).have.property('requestId', '187d6e46-a992-442f-865a-2cd194c7297d')
      should(logs[2]).have.property('message', 'this is from node 10 runtime too...')
      should(logs[2]).have.property('level', 'ERROR')
    })
  })

  describe('of default output', () => {
    const testEvent = {
      messageType: 'DATA_MESSAGE',
      owner: '000000000000',
      logGroup: 'test-log-group',
      logStream: 'test-log-stream',
      subscriptionFilters: [ 'test-filter' ],
      logEvents: [
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message: 'START RequestId: f6a55753-b02b-4b42-bcee-432133f66d26 Version: blabla\n'
        },
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message: 'START RequestId: f6a55753-b02b-4b42-bcee-432133f66d26 Version: 937'
        },
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message: 'END RequestId: f6a55753-b02b-4b42-bcee-432133f66d26'
        },
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message: 'REPORT RequestId: f6a55753-b02b-4b42-bcee-432133f66d26\tDuration: 9.34 ms\tBilled Duration: 100 ms \tMemory Size: 192 MB\tMax Memory Used: 70 MB'
        } ]
    }

    it('should work as expected', () => {
      const logs = getLogs(testEvent)
      should(logs).length(4)
      should(logs[0]).have.property('@timestamp')
      should(logs[0]).have.property('requestId', 'f6a55753-b02b-4b42-bcee-432133f66d26')
      should(logs[0]).have.property('message', 'START RequestId: f6a55753-b02b-4b42-bcee-432133f66d26 Version: blabla')
      should(logs[0]).have.property('version', 'blabla')
      should(logs[1]).have.property('@timestamp')
      should(logs[1]).have.property('requestId', 'f6a55753-b02b-4b42-bcee-432133f66d26')
      should(logs[1]).have.property('message', 'START RequestId: f6a55753-b02b-4b42-bcee-432133f66d26 Version: 937')
      should(logs[1]).have.property('version', 937)
      should(logs[2]).have.property('@timestamp')
      should(logs[2]).have.property('requestId', 'f6a55753-b02b-4b42-bcee-432133f66d26')
      should(logs[2]).have.property('message', 'END RequestId: f6a55753-b02b-4b42-bcee-432133f66d26')
      should(logs[3]).have.property('@timestamp')
      should(logs[3]).have.property('requestId', 'f6a55753-b02b-4b42-bcee-432133f66d26')
      // eslint-disable-next-line no-tabs
      should(logs[3]).have.property('message', 'REPORT RequestId: f6a55753-b02b-4b42-bcee-432133f66d26\tDuration: 9.34 ms\tBilled Duration: 100 ms \tMemory Size: 192 MB\tMax Memory Used: 70 MB')
      should(logs[3]).have.property('duration', 9.34)
      should(logs[3]).have.property('billedDuration', 100)
      should(logs[3]).have.property('memorySize', 192)
      should(logs[3]).have.property('maxMemoryUsed', 70)
    })
  })
})
