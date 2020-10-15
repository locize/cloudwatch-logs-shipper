const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { createHash } = require('crypto')

let customTemplateExtender
try {
  customTemplateExtender = require('./customTemplateExtender')
} catch (e) {}

exec('aws logs describe-log-groups --region eu-west-1', { env: process.env }, (err, stdout, stderr) => {
  if (err) return console.error(err)

  const resultJSON = JSON.parse(stdout)
  const desiredLogGroupNames = resultJSON.logGroups.filter((lg) => {
    return lg.logGroupName.indexOf(require('./package.json').name) < 0 &&
           lg.logGroupName.indexOf('cloudwatch-alarm-to-slack') < 0// &&
           //  lg.logGroupName.indexOf('logz-shipper') < 0 &&
           //  (lg.logGroupName.indexOf('locize-dev-') > -1 || lg.logGroupName.indexOf('locize-prod-') > -1)
  }).map((lg) => lg.logGroupName)

  let appSam = require('./app-sam.json')
  if (customTemplateExtender) appSam = customTemplateExtender(appSam) || appSam
  appSam.Resources.CloudWatchFunction.Properties.Events = desiredLogGroupNames.map((name) => ({
    Type: 'CloudWatchLogs',
    Properties: {
      LogGroupName: name,
      FilterPattern: ''
    }
  })).reduce((prev, curr) => {
    const hasher = createHash('md5')
    hasher.update(curr.Properties.LogGroupName)
    prev[hasher.digest('hex')] = curr
    return prev
  }, {})

  fs.writeFile(path.join(__dirname, 'app-sam-with-events.json'), JSON.stringify(appSam, null, 2), (err) => {
    if (err) console.error(err)
  })
})
