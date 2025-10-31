import analyzeMessage from './analyzeMessage.js'

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
      if (options.omitStartAndEnd && typeof toLog.message === 'string' && (toLog.message.startsWith('START RequestId: ') || toLog.message.startsWith('END RequestId: ') || toLog.message.startsWith('INIT_START Runtime Version: '))) return
      if (options.omitStartAndEnd && toLog.message && typeof toLog.message !== 'string' && (toLog.message.type === 'platform.start' || toLog.message.type === 'platform.end' || toLog.message.type === 'platform.initStart')) return
      if (options.omitStartAndEnd && toLog.time && (toLog.type === 'platform.start' || toLog.type === 'platform.end' || toLog.type === 'platform.initStart')) return
      logs.push(toLog)
    }
  })
  return logs
}
