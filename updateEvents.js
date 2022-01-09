import { exec } from 'child_process'
import { readFileSync, writeFile, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const hasCustomTemplateExtender = existsSync(join(__dirname, './customTemplateExtender.js'))

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

exec('aws logs describe-log-groups --region eu-west-1', { env: process.env }, (err, stdout, stderr) => {
  if (err) return console.error(err)

  const resultJSON = JSON.parse(stdout)
  const desiredLogGroupNames = resultJSON.logGroups.filter((lg) => {
    return lg.logGroupName.indexOf(pkg.name) < 0 &&
           lg.logGroupName.indexOf('cloudwatch-alarm-to-slack') < 0// &&
           //  lg.logGroupName.indexOf('logz-shipper') < 0 &&
           //  (lg.logGroupName.indexOf('locize-dev-') > -1 || lg.logGroupName.indexOf('locize-prod-') > -1)
  }).map((lg) => lg.logGroupName)

  let appSam = JSON.parse(readFileSync(new URL('./app-sam.json', import.meta.url)))

  function finish () {
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

    writeFile(join(__dirname, 'app-sam-with-events.json'), JSON.stringify(appSam, null, 2), (err) => {
      if (err) console.error(err)
    })
  }
  if (!hasCustomTemplateExtender) return finish()

  import('./customTemplateExtender.js').then((ret) => {
    appSam = ret.default(appSam) || appSam
    finish()
  })
})
