const isoDateRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default (toLog, options = {}) => {
  if (toLog.message.startsWith('START RequestId: ')) {
    const splittedWhitespace = toLog.message.split(' ')
    toLog.requestId = splittedWhitespace[2]
    if (splittedWhitespace.length > 4) {
      toLog.version = splittedWhitespace[4]
      if (!isNaN(toLog.version)) toLog.version = parseInt(toLog.version)
    }
  } else if (toLog.message.startsWith('END RequestId: ')) {
    const splittedWhitespace = toLog.message.split(' ')
    toLog.requestId = splittedWhitespace[2]
  } else if (toLog.message.startsWith('REPORT RequestId: ')) {
    const splittedWhitespace = toLog.message.split(/ |\t/)
    toLog.requestId = splittedWhitespace[2]
    toLog.duration = splittedWhitespace[4]
    if (!isNaN(toLog.duration)) toLog.duration = parseFloat(toLog.duration)
    toLog.billedDuration = splittedWhitespace[8]
    if (!isNaN(toLog.billedDuration)) toLog.billedDuration = parseFloat(toLog.billedDuration)
    if (toLog.message.indexOf('XRAY') < 0) {
      toLog.memorySize = splittedWhitespace[13]
      if (toLog.memorySize === 'MB') toLog.memorySize = splittedWhitespace[12]
      toLog.maxMemoryUsed = splittedWhitespace[18]
      if (toLog.maxMemoryUsed === 'MB') toLog.maxMemoryUsed = splittedWhitespace[17]
      toLog.initDuration = splittedWhitespace[21]
      if (toLog.initDuration === 'ms') toLog.initDuration = splittedWhitespace[20]
    } else {
      toLog.memorySize = splittedWhitespace[12]
      if (toLog.memorySize === 'MB') toLog.memorySize = splittedWhitespace[11]
      toLog.maxMemoryUsed = splittedWhitespace[17]
      if (toLog.maxMemoryUsed === 'MB') toLog.maxMemoryUsed = splittedWhitespace[16]
      toLog.initDuration = splittedWhitespace[20]
      if (toLog.initDuration === 'ms') toLog.initDuration = splittedWhitespace[19]
      if (splittedWhitespace.indexOf('TraceId:') > -1) {
        toLog.xRayTraceId = splittedWhitespace[splittedWhitespace.indexOf('TraceId:') + 1]
      }
      if (splittedWhitespace.indexOf('SegmentId:') > -1) {
        toLog.segmentId = splittedWhitespace[splittedWhitespace.indexOf('SegmentId:') + 1]
      }
      if (splittedWhitespace.indexOf('Sampled:') > -1) {
        toLog.sampled = splittedWhitespace[splittedWhitespace.indexOf('Sampled:') + 1]
        toLog.sampled = toLog.sampled === 'true'
      }
    }
    if (!isNaN(toLog.memorySize)) toLog.memorySize = parseInt(toLog.memorySize)
    if (!isNaN(toLog.maxMemoryUsed)) toLog.maxMemoryUsed = parseFloat(toLog.maxMemoryUsed)
    if (!isNaN(toLog.initDuration)) toLog.initDuration = parseFloat(toLog.initDuration)
    toLog.memoryDifference = toLog.memorySize - toLog.maxMemoryUsed
    if (options.reduceReport) toLog.message = toLog.message.substring(0, 54)
  } else if (toLog.message.startsWith('{') && toLog.message.endsWith('}')) {
    try {
      const parsedJSON = JSON.parse(toLog.message)
      for (const member in parsedJSON) toLog[member] = parsedJSON[member]
      if (typeof toLog.message === 'string' && toLog.message.startsWith('{') && toLog.message.endsWith('}')) {
        try {
          toLog.message = JSON.parse(toLog.message)
        } catch (e) {}
      }
      if (toLog.message && typeof toLog.message !== 'string' && toLog.message.message) {
        const msg = toLog.message
        for (const member in msg) toLog[member] = msg[member]
      }
    } catch (e) {}
  } else if (toLog.message.indexOf('\t') > 0) {
    const splittedByTabs = toLog.message.split('\t')
    if (splittedByTabs.length > 1 && isoDateRegex.test(splittedByTabs[0])) {
      // toLog['@timestamp'] = (new Date(splittedByTabs[0])).toISOString()
      splittedByTabs.splice(0, 1)
      if (uuidRegex.test(splittedByTabs[0]) || splittedByTabs[0] === 'undefined') {
        toLog.requestId = splittedByTabs.shift()
        if (splittedByTabs.length > 1 && ['INFO', 'ERROR', 'WARN', 'TRACE', 'DEBUG', 'FATAL'].indexOf(splittedByTabs[0]) > -1) {
          toLog.level = splittedByTabs.shift()
        }
        if (splittedByTabs.length > 0) {
          if (splittedByTabs[0].endsWith('}')) {
            if (splittedByTabs[0].startsWith('Unhandled Promise Rejection\n{')) {
              toLog.message = 'Unhandled Promise Rejection'
              splittedByTabs[0] = splittedByTabs[0].substring(toLog.message.length + 1)
            }
            if (splittedByTabs[0].startsWith('Uncaught Exception\n{')) {
              toLog.message = 'Uncaught Exception'
              splittedByTabs[0] = splittedByTabs[0].substring(toLog.message.length + 1)
            }
          } else if (splittedByTabs.length > 1 && splittedByTabs[1].endsWith('}')) {
            if (splittedByTabs[0].startsWith('Invoke Error')) toLog.message = 'Invoke Error'
            if (splittedByTabs[0].startsWith('Unhandled Promise Rejection')) toLog.message = 'Unhandled Promise Rejection'
            if (splittedByTabs[0].startsWith('Uncaught Exception')) toLog.message = 'Uncaught Exception'
            const joinedInvokeError = splittedByTabs.join('\t')
            splittedByTabs[0] = joinedInvokeError.substring(joinedInvokeError.indexOf('{'))
          }
          if (splittedByTabs[0].startsWith('{') && splittedByTabs[0].endsWith('}')) {
            try {
              const parsedJSON = JSON.parse(splittedByTabs[0])
              for (const member in parsedJSON) toLog[member] = parsedJSON[member]
            } catch (e) {}
          } else {
            toLog.message = splittedByTabs.join('\n')
          }
        }
      } else if (splittedByTabs[0].indexOf('\n') > 0) {
        const splittedByNewLine = splittedByTabs[0].split('\n')
        if (splittedByNewLine.length > 1 && uuidRegex.test(splittedByNewLine[0])) {
          toLog.requestId = splittedByNewLine.shift()
          toLog.message = splittedByNewLine.join('\n')
          if (toLog.message.startsWith('{') && toLog.message.endsWith('}')) {
            try {
              const parsedJSON = JSON.parse(toLog.message)
              for (const member in parsedJSON) toLog[member] = parsedJSON[member]
            } catch (e) {}
          }
        }
      }
    }
  } else if (toLog.message.indexOf(' ') > 0) {
    const splittedBySpaces = toLog.message.split(' ')
    if (splittedBySpaces.length > 1 && isoDateRegex.test(splittedBySpaces[0])) {
      // toLog['@timestamp'] = (new Date(splittedBySpaces[0])).toISOString()
      splittedBySpaces.splice(0, 1)
      if (uuidRegex.test(splittedBySpaces[0])) {
        toLog.requestId = splittedBySpaces.shift()
      }
    }
  }
}
