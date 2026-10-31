import analyzeMessage from './analyzeMessage.js'

// options.drop: compiled rules (compileDropRules); a record matching every field of one rule is
// not shipped. A rule maps a field of the analyzed record to a value: equal as a string, or a
// regular expression when the value starts and ends with '/' ('/pattern/flags', so a literal
// value like '/api/' is a regex too). Patterns run against log fields requests can influence:
// keep them anchored and simple. Example: drop the runtime's line for an API Gateway authorizer
// that denies by throwing 'Unauthorized' (the only way to answer 401) when the authorizer logs
// the denial itself: { "functionName": "/-authorizer$/", "message": "Invoke Error", "errorMessage": "Unauthorized" }
const regexRule = /^\/(.*)\/([a-z]*)$/

// Validates and compiles once; throws on anything but a list of non-empty objects whose values
// are strings, numbers or booleans, or on an invalid pattern, so a bad config drops nothing
// instead of failing every batch.
export function compileDropRules (rules) {
  if (!Array.isArray(rules)) throw new Error('DROP must be a JSON list of rules')
  return rules.map((rule, i) => {
    if (!rule || typeof rule !== 'object' || Array.isArray(rule) || Object.keys(rule).length === 0) throw new Error(`DROP rule ${i} must be a non-empty object`)
    return Object.keys(rule).map((field) => {
      const value = rule[field]
      if (!['string', 'number', 'boolean'].includes(typeof value)) throw new Error(`DROP rule ${i}, field ${field}: value must be a string, number or boolean`)
      const re = String(value).match(regexRule)
      if (re && !re[1]) throw new Error(`DROP rule ${i}, field ${field}: an empty pattern would match every record`)
      // without g and y: test() would keep state between records
      return re ? { field, re: new RegExp(re[1], re[2].replace(/[gy]/g, '')) } : { field, eq: String(value) }
    })
  })
}

export function matchesRule (record, rule) {
  return rule.length > 0 && rule.every(({ field, re, eq }) => {
    const actual = record[field] === undefined || record[field] === null ? '' : String(record[field])
    return re ? re.test(actual) : actual === eq
  })
}

export default (data, options = {}) => {
  const logs = []
  data.logEvents = data.logEvents || []
  data.logEvents.forEach((logEvent) => {
    logEvent['@timestamp'] = logEvent['@timestamp'] || logEvent.timestamp
    if (logEvent['@timestamp']) logEvent['@timestamp'] = new Date(logEvent['@timestamp']).toISOString()
    delete logEvent.timestamp
    if (logEvent['@timestamp'] && logEvent.message) {
      logEvent.message = logEvent.message.trim('\n')
      const toLog = {
        logGroup: data.logGroup,
        logStream: data.logStream,
        messageType: data.messageType,
        owner: data.owner,
        message: logEvent.message,
        '@timestamp': logEvent['@timestamp']
      }
      if (options.omit) {
        options.omit.forEach((what) => {
          delete toLog[what]
        })
      }
      if (toLog.logGroup && toLog.logGroup.startsWith('/aws/lambda/')) {
        toLog.functionName = toLog.logGroup.substring(12)
      }
      analyzeMessage(toLog, options)
      if (options.drop && options.drop.some((rule) => matchesRule(toLog, rule))) return
      if (options.omitStartAndEnd && typeof toLog.message === 'string' && (toLog.message.startsWith('START RequestId: ') || toLog.message.startsWith('END RequestId: ') || toLog.message.startsWith('INIT_START Runtime Version: '))) return
      if (options.omitStartAndEnd && toLog.message && typeof toLog.message !== 'string' && (toLog.message.type === 'platform.start' || toLog.message.type === 'platform.end' || toLog.message.type === 'platform.initStart')) return
      if (options.omitStartAndEnd && toLog.time && (toLog.type === 'platform.start' || toLog.type === 'platform.end' || toLog.type === 'platform.initStart')) return
      logs.push(toLog)
    }
  })
  return logs
}
