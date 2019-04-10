const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

exec('aws logs describe-log-groups --region eu-west-1', { env: process.env }, (err, stdout, stderr) => {
  if (err) return console.error(err)

  const resultJSON = JSON.parse(stdout)
  const desiredLogGroupNames = resultJSON.logGroups.filter((lg) => lg.logGroupName.indexOf(require('./package.json').name) < 0 && lg.logGroupName.indexOf('cloudwatch-alarm-to-slack') < 0).map((lg) => lg.logGroupName)

  const appSam = require('./app-sam.json')
  appSam.Resources.CloudWatchFunction.Properties.Events = desiredLogGroupNames.map((name) => ({
    Type: 'CloudWatchLogs',
    Properties: {
      LogGroupName: name,
      FilterPattern: ''
    }
  })).reduce((prev, curr, i) => {
    prev[i.toString()] = curr
    return prev
  }, {})

  fs.writeFile(path.join(__dirname, 'app-sam-with-events.json'), JSON.stringify(appSam, null, 2), (err) => {
    if (err) console.error(err)
  })
})
