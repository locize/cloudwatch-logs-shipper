import should from 'should'
import getLogs from '../lib/getLogs.js'

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
        },
        {
          id: '01234567890123456789012345678901234567890123456389012324',
          timestamp: 1484275497106,
          // eslint-disable-next-line no-tabs,quotes,no-useless-escape
          message: `2020-03-09T18:27:45.244Z	eb2685ce-6078-4f95-8180-1601153d2692	ERROR	Invoke Error 	
          {
              "errorType": "Error",
              "errorMessage": "No or wrong argument!",
              "stack": [
                  "Error: No or wrong argument!",
                  "    at module.exports (/var/task/lib/getBearerAuthParam.js:2:48)",
                  "    at Runtime.exports.handler (/var/task/lambda.js:58:18)",
                  "    at Runtime.handleOnce (/var/runtime/Runtime.js:66:25)"
              ]
          }`
        },
        {
          id: '02334567890123456789012345678901234567890123456789012345',
          timestamp: 1584275477103,
          message:
          // eslint-disable-next-line no-tabs
          `2020-03-28T15:20:09.673Z	ce3fe71f-4e3c-4701-a269-25ba9616728f	ERROR	Unhandled Promise Rejection 	
{
    "errorType": "Runtime.UnhandledPromiseRejection",
    "errorMessage": "TypeError: Cannot read property 'toJSON' of undefined",
    "reason": {
        "errorType": "TypeError",
        "errorMessage": "Cannot read property 'toJSON' of undefined",
        "stack": [
            "TypeError: Cannot read property 'toJSON' of undefined",
            "    at $maini (eval at build (/var/task/node_modules/fast-json-stringify/index.js:136:20), <anonymous>:98:30)",
            "    at Object.$main (eval at build (/var/task/node_modules/fast-json-stringify/index.js:136:20), <anonymous>:88:17)",
            "    at serialize (/var/task/node_modules/fastify/lib/validation.js:132:41)",
            "    at preserializeHookEnd (/var/task/node_modules/fastify/lib/reply.js:304:15)",
            "    at next (/var/task/node_modules/fastify/lib/hooks.js:103:7)",
            "    at handleResolve (/var/task/node_modules/fastify/lib/hooks.js:114:5)",
            "    at processTicksAndRejections (internal/process/task_queues.js:97:5)"
        ]
    },
    "promise": {},
    "stack": [
        "Runtime.UnhandledPromiseRejection: TypeError: Cannot read property 'toJSON' of undefined",
        "    at process.<anonymous> (/var/runtime/index.js:35:15)",
        "    at process.emit (events.js:311:20)",
        "    at process.EventEmitter.emit (domain.js:482:12)",
        "    at processPromiseRejections (internal/process/promises.js:209:33)",
        "    at processTicksAndRejections (internal/process/task_queues.js:98:32)"
    ]
}`
        },
        {
          id: '01232567890123456789012345678901234567890123456789012345',
          timestamp: 1584275477103,
          message:
            // eslint-disable-next-line no-tabs
            '2021-09-02T08:08:47.102Z\tundefined\tERROR\tUncaught Exception \t{"errorType":"Error","errorMessage":"Must use import to load ES Module: /var/task/node_modules/node-fetch/src/index.js\\nrequire() of ES modules is not supported.\\nrequire() of /var/task/node_modules/node-fetch/src/index.js from /var/task/lib/project/lib/extendWithLocalistarsProjectInfos.js is an ES module file as it is a .js file whose nearest parent package.json contains \\"type\\": \\"module\\" which defines all .js files in that package scope as ES modules.\\nInstead rename index.js to end in .cjs, change the requiring code to use import(), or remove \\"type\\": \\"module\\" from /var/task/node_modules/node-fetch/package.json.\\n","code":"ERR_REQUIRE_ESM","stack":["Error [ERR_REQUIRE_ESM]: Must use import to load ES Module: /var/task/node_modules/node-fetch/src/index.js","require() of ES modules is not supported.","require() of /var/task/node_modules/node-fetch/src/index.js from /var/task/lib/project/lib/extendWithLocalistarsProjectInfos.js is an ES module file as it is a .js file whose nearest parent package.json contains \\"type\\": \\"module\\" which defines all .js files in that package scope as ES modules.","Instead rename index.js to end in .cjs, change the requiring code to use import(), or remove \\"type\\": \\"module\\" from /var/task/node_modules/node-fetch/package.json.","","    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1089:13)","    at Module.load (internal/modules/cjs/loader.js:937:32)","    at Function.Module._load (internal/modules/cjs/loader.js:778:12)","    at Module.require (internal/modules/cjs/loader.js:961:19)","    at require (internal/modules/cjs/helpers.js:92:18)","    at Object.<anonymous> (/var/task/lib/project/lib/extendWithLocalistarsProjectInfos.js:2:15)","    at Module._compile (internal/modules/cjs/loader.js:1072:14)","    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1101:10)","    at Module.load (internal/modules/cjs/loader.js:937:32)","    at Function.Module._load (internal/modules/cjs/loader.js:778:12)"]}'
        }]
    }

    it('should work as expected', () => {
      const logs = getLogs(testEvent)
      should(logs).length(6)
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
      should(logs[3]).have.property('requestId', 'eb2685ce-6078-4f95-8180-1601153d2692')
      should(logs[3]).have.property('message', 'Invoke Error')
      should(logs[3]).have.property('errorMessage', 'No or wrong argument!')
      should(logs[3]).have.property('errorType', 'Error')
      should(logs[3]).have.property('stack')
      should(logs[4]).have.property('requestId', 'ce3fe71f-4e3c-4701-a269-25ba9616728f')
      should(logs[4]).have.property('message', 'Unhandled Promise Rejection')
      should(logs[4]).have.property('errorMessage', 'TypeError: Cannot read property \'toJSON\' of undefined')
      should(logs[4]).have.property('errorType', 'Runtime.UnhandledPromiseRejection')
      should(logs[5]).have.property('requestId', 'undefined')
      should(logs[5]).have.property('message', 'Uncaught Exception')
      should(logs[5]).have.property('errorMessage', 'Must use import to load ES Module: /var/task/node_modules/node-fetch/src/index.js\n' +
        'require() of ES modules is not supported.\n' +
        'require() of /var/task/node_modules/node-fetch/src/index.js from /var/task/lib/project/lib/extendWithLocalistarsProjectInfos.js is an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which defines all .js files in that package scope as ES modules.\n' +
        'Instead rename index.js to end in .cjs, change the requiring code to use import(), or remove "type": "module" from /var/task/node_modules/node-fetch/package.json.\n')
      should(logs[5]).have.property('errorType', 'Error')
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
        },
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message: 'REPORT RequestId: a1d3049c-3185-4852-8b45-aec8f2d4107d Duration: 2888.47 ms Billed Duration: 2900 ms Memory Size: 192 MB Max Memory Used: 98 MB Init Duration: 474.27 ms\nXRAY TraceId: 1-5d77b095-7b10875864d08196cbad28d6 SegmentId: 3fd69a1119839b2c Sampled: false'
        },
        {
          id: '01234567890123456789012345678901234567890123456789012314',
          timestamp: 1484275477105,
          message: 'REPORT RequestId: 931635bd-4d2b-499e-a591-3f55ef31e1e0\tDuration: 57.07 ms\tBilled Duration: 100 ms\tMemory Size: 192 MB\tMax Memory Used: 167 MB'
        },
        {
          id: '01234567890123456789012345678901234567890123456789023314',
          timestamp: 1484275477106,
          message: '2020-01-14T07:39:49.657Z 63a96020-4e07-4676-81a3-66fd47ed4815 Task timed out after 30.03 seconds'
        },
        {
          id: '01234567890123456789012345678901234567892342345678902336',
          timestamp: 1484275477127,
          message: 'REPORT RequestId: 2b0cbe4b-1180-489f-949f-2ccd41d97c44\tDuration: 42.35 ms\tBilled Duration: 100 ms\tMemory Size: 768 MB\tMax Memory Used: 98 MB\tXRAY TraceId: 1-5e217425-b2c3bdff0cfb667d712a5880\tSegmentId: 2e3b43185b988b12\tSampled: true\t'
        },
        {
          id: '13234567890123456789012345678901234567892342345678902336',
          timestamp: 1484275477128,
          message: 'REPORT RequestId: 971ab2a3-bb53-4bd5-b4eb-d96ba7272fdb\tDuration: 66538.52 ms\tBilled Duration: 66539 ms\tMemory Size: 1408 MB\tMax Memory Used: 408 MB\tInit Duration: 155.60 ms'
        }
      ]
    }

    it('should work as expected', () => {
      const logs = getLogs(testEvent)
      should(logs).length(9)
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
      should(logs[3]).have.property('memoryDifference', 122)
      // eslint-disable-next-line no-tabs
      should(logs[4]).have.property('message', 'REPORT RequestId: a1d3049c-3185-4852-8b45-aec8f2d4107d Duration: 2888.47 ms Billed Duration: 2900 ms Memory Size: 192 MB Max Memory Used: 98 MB Init Duration: 474.27 ms\nXRAY TraceId: 1-5d77b095-7b10875864d08196cbad28d6 SegmentId: 3fd69a1119839b2c Sampled: false')
      should(logs[4]).have.property('duration', 2888.47)
      should(logs[4]).have.property('billedDuration', 2900)
      should(logs[4]).have.property('memorySize', 192)
      should(logs[4]).have.property('maxMemoryUsed', 98)
      should(logs[4]).have.property('memoryDifference', 94)
      // eslint-disable-next-line no-tabs
      should(logs[5]).have.property('message', 'REPORT RequestId: 931635bd-4d2b-499e-a591-3f55ef31e1e0\tDuration: 57.07 ms\tBilled Duration: 100 ms\tMemory Size: 192 MB\tMax Memory Used: 167 MB')
      should(logs[5]).have.property('duration', 57.07)
      should(logs[5]).have.property('billedDuration', 100)
      should(logs[5]).have.property('memorySize', 192)
      should(logs[5]).have.property('maxMemoryUsed', 167)
      should(logs[5]).have.property('memoryDifference', 25)
      should(logs[6]).have.property('message', '2020-01-14T07:39:49.657Z 63a96020-4e07-4676-81a3-66fd47ed4815 Task timed out after 30.03 seconds')
      should(logs[6]).have.property('requestId', '63a96020-4e07-4676-81a3-66fd47ed4815')
      should(logs[7]).have.property('message', 'REPORT RequestId: 2b0cbe4b-1180-489f-949f-2ccd41d97c44\tDuration: 42.35 ms\tBilled Duration: 100 ms\tMemory Size: 768 MB\tMax Memory Used: 98 MB\tXRAY TraceId: 1-5e217425-b2c3bdff0cfb667d712a5880\tSegmentId: 2e3b43185b988b12\tSampled: true')
      should(logs[7]).have.property('requestId', '2b0cbe4b-1180-489f-949f-2ccd41d97c44')
      should(logs[7]).have.property('duration', 42.35)
      should(logs[7]).have.property('billedDuration', 100)
      should(logs[7]).have.property('memorySize', 768)
      should(logs[7]).have.property('maxMemoryUsed', 98)
      should(logs[7]).have.property('xRayTraceId', '1-5e217425-b2c3bdff0cfb667d712a5880')
      should(logs[7]).have.property('segmentId', '2e3b43185b988b12')
      should(logs[7]).have.property('sampled', true)
      should(logs[8]).have.property('message', 'REPORT RequestId: 971ab2a3-bb53-4bd5-b4eb-d96ba7272fdb\tDuration: 66538.52 ms\tBilled Duration: 66539 ms\tMemory Size: 1408 MB\tMax Memory Used: 408 MB\tInit Duration: 155.60 ms')
      should(logs[8]).have.property('requestId', '971ab2a3-bb53-4bd5-b4eb-d96ba7272fdb')
      should(logs[8]).have.property('duration', 66538.52)
      should(logs[8]).have.property('billedDuration', 66539)
      should(logs[8]).have.property('memorySize', 1408)
      should(logs[8]).have.property('maxMemoryUsed', 408)
      should(logs[8]).have.property('memoryDifference', 1000)
      should(logs[8]).have.property('initDuration', 155.60)
    })
  })

  describe('of default output with omitStartAndEnd set to true', () => {
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
          id: '01234567890123456789012345678901234567890123456789012145',
          timestamp: 1484275477103,
          message: 'INIT_START Runtime Version: nodejs:18.v4\tRuntime Version ARN: arn:aws:lambda:eu-west-1::runtime:cfb8ef15d2d94e247924207a1fe0d5b733cbded89607d2a0d020a11c7a95fde6'
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
        },
        {
          id: '01234567890123456789012345678901234567890123456789012345',
          timestamp: 1484275477103,
          message: 'REPORT RequestId: a1d3049c-3185-4852-8b45-aec8f2d4107d Duration: 2888.47 ms Billed Duration: 2900 ms Memory Size: 192 MB Max Memory Used: 98 MB Init Duration: 474.27 ms\nXRAY TraceId: 1-5d77b095-7b10875864d08196cbad28d6 SegmentId: 3fd69a1119839b2c Sampled: false'
        },
        {
          id: '01234567890123456789012345678901234567890123456789012314',
          timestamp: 1484275477105,
          message: 'REPORT RequestId: 931635bd-4d2b-499e-a591-3f55ef31e1e0\tDuration: 57.07 ms\tBilled Duration: 100 ms\tMemory Size: 192 MB\tMax Memory Used: 167 MB'
        },
        {
          id: '01234567890123456789012345678901234567890123456789023314',
          timestamp: 1484275477106,
          message: '2020-01-14T07:39:49.657Z 63a96020-4e07-4676-81a3-66fd47ed4815 Task timed out after 30.03 seconds'
        },
        {
          id: '01234567890123456789012345678901234567892342345678902336',
          timestamp: 1484275477127,
          message: 'REPORT RequestId: 2b0cbe4b-1180-489f-949f-2ccd41d97c44\tDuration: 42.35 ms\tBilled Duration: 100 ms\tMemory Size: 768 MB\tMax Memory Used: 98 MB\tXRAY TraceId: 1-5e217425-b2c3bdff0cfb667d712a5880\tSegmentId: 2e3b43185b988b12\tSampled: true\t'
        }
      ]
    }

    it('should work as expected', () => {
      const logs = getLogs(testEvent, { omitStartAndEnd: true })
      should(logs).length(5)
      should(logs[0]).have.property('@timestamp')
      should(logs[0]).have.property('requestId', 'f6a55753-b02b-4b42-bcee-432133f66d26')
      // eslint-disable-next-line no-tabs
      should(logs[0]).have.property('message', 'REPORT RequestId: f6a55753-b02b-4b42-bcee-432133f66d26\tDuration: 9.34 ms\tBilled Duration: 100 ms \tMemory Size: 192 MB\tMax Memory Used: 70 MB')
      should(logs[0]).have.property('duration', 9.34)
      should(logs[0]).have.property('billedDuration', 100)
      should(logs[0]).have.property('memorySize', 192)
      should(logs[0]).have.property('maxMemoryUsed', 70)
      should(logs[0]).have.property('memoryDifference', 122)
      // eslint-disable-next-line no-tabs
      should(logs[1]).have.property('message', 'REPORT RequestId: a1d3049c-3185-4852-8b45-aec8f2d4107d Duration: 2888.47 ms Billed Duration: 2900 ms Memory Size: 192 MB Max Memory Used: 98 MB Init Duration: 474.27 ms\nXRAY TraceId: 1-5d77b095-7b10875864d08196cbad28d6 SegmentId: 3fd69a1119839b2c Sampled: false')
      should(logs[1]).have.property('duration', 2888.47)
      should(logs[1]).have.property('billedDuration', 2900)
      should(logs[1]).have.property('memorySize', 192)
      should(logs[1]).have.property('maxMemoryUsed', 98)
      should(logs[1]).have.property('memoryDifference', 94)
      // eslint-disable-next-line no-tabs
      should(logs[2]).have.property('message', 'REPORT RequestId: 931635bd-4d2b-499e-a591-3f55ef31e1e0\tDuration: 57.07 ms\tBilled Duration: 100 ms\tMemory Size: 192 MB\tMax Memory Used: 167 MB')
      should(logs[2]).have.property('duration', 57.07)
      should(logs[2]).have.property('billedDuration', 100)
      should(logs[2]).have.property('memorySize', 192)
      should(logs[2]).have.property('maxMemoryUsed', 167)
      should(logs[2]).have.property('memoryDifference', 25)
      should(logs[3]).have.property('message', '2020-01-14T07:39:49.657Z 63a96020-4e07-4676-81a3-66fd47ed4815 Task timed out after 30.03 seconds')
      should(logs[3]).have.property('requestId', '63a96020-4e07-4676-81a3-66fd47ed4815')
      should(logs[4]).have.property('message', 'REPORT RequestId: 2b0cbe4b-1180-489f-949f-2ccd41d97c44\tDuration: 42.35 ms\tBilled Duration: 100 ms\tMemory Size: 768 MB\tMax Memory Used: 98 MB\tXRAY TraceId: 1-5e217425-b2c3bdff0cfb667d712a5880\tSegmentId: 2e3b43185b988b12\tSampled: true')
      should(logs[4]).have.property('requestId', '2b0cbe4b-1180-489f-949f-2ccd41d97c44')
      should(logs[4]).have.property('duration', 42.35)
      should(logs[4]).have.property('billedDuration', 100)
      should(logs[4]).have.property('memorySize', 768)
      should(logs[4]).have.property('maxMemoryUsed', 98)
      should(logs[4]).have.property('xRayTraceId', '1-5e217425-b2c3bdff0cfb667d712a5880')
      should(logs[4]).have.property('segmentId', '2e3b43185b988b12')
      should(logs[4]).have.property('sampled', true)
    })
  })
})
