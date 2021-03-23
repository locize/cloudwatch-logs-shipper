const analyzeMessage = require('./analyzeMessage')

module.exports = (data, options) => {
  options = options || {}
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
      if (toLog.logGroup && toLog.logGroup.startsWith('/aws/lambda/')) {
        toLog.functionName = toLog.logGroup.substring(12)
      }
      analyzeMessage(toLog)
      if (options.omitStartAndEnd && toLog.message && (toLog.message.startsWith('START RequestId: ') || toLog.message.startsWith('END RequestId: '))) return
      logs.push(toLog)
    }
  })
  return logs
}
