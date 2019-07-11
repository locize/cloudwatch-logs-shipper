const isoDateRegex = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

module.exports = (toLog) => {
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
    toLog.memorySize = splittedWhitespace[13]
    if (!isNaN(toLog.memorySize)) toLog.memorySize = parseInt(toLog.memorySize)
    toLog.maxMemoryUsed = splittedWhitespace[18]
    if (!isNaN(toLog.maxMemoryUsed)) toLog.maxMemoryUsed = parseFloat(toLog.maxMemoryUsed)
  } else if (toLog.message.startsWith('{') && toLog.message.endsWith('}')) {
    const parsedJSON = JSON.parse(toLog.message)
    for (const member in parsedJSON) toLog[member] = parsedJSON[member]
  } else if (toLog.message.indexOf('\t') > 0) {
    const splittedByTabs = toLog.message.split('\t')
    if (splittedByTabs.length > 1 && isoDateRegex.test(splittedByTabs[0])) {
      // toLog['@timestamp'] = (new Date(splittedByTabs[0])).toISOString()
      splittedByTabs.splice(0, 1)
      if (uuidRegex.test(splittedByTabs[0])) {
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
  }
}
