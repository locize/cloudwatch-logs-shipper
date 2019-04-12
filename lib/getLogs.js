const analyzeMessage = require('./analyzeMessage')

module.exports = (data) => {
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
      logs.push(toLog)
    }
  })
  return logs
}
