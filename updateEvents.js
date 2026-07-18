import { exec } from 'child_process'
import { promisify } from 'util'
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
           lg.logGroupName.indexOf('cloudwatch-alarm-to-slack') < 0 &&
           lg.logGroupName.indexOf('API-Gateway') < 0 &&
           lg.logGroupName.indexOf('/us-east-1.') < 0 // &&
           // (!process.env.ENVIRONMENT || lg.logGroupName.indexOf(`-${process.env.ENVIRONMENT}-`) > 0) &&
           //  (lg.logGroupName.indexOf('locize-dev-') > -1 || lg.logGroupName.indexOf('locize-prod-') > -1)
  }).map((lg) => lg.logGroupName)

  let appSam = JSON.parse(readFileSync(new URL('./app-sam.json', import.meta.url)))

  function finish () {
    desiredLogGroupNames.forEach((name) => {
      const hasher = createHash('md5')
      hasher.update(name)
      const key = 'Sub' + hasher.digest('hex')
      appSam.Resources[key] = {
        Type: 'AWS::Logs::SubscriptionFilter',
        DependsOn: 'CloudWatchLogsPermission',
        Properties: {
          LogGroupName: name,
          FilterPattern: '',
          DestinationArn: { 'Fn::GetAtt': ['CloudWatchFunction', 'Arn'] }
        }
      }
    })

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

// retention drift-catcher — only fills groups with NO retention set (new fns,
// lazily created Lambda@Edge replica groups); manually chosen values are never touched
const isDev = (name) => name.indexOf('-dev-') > -1 || name.endsWith('/dev')
const retentionDaysFor = (name, region) => {
  if (region !== 'eu-west-1' || name.indexOf('/us-east-1.') > -1) return isDev(name) ? 30 : 365 // edge fn home + replica groups
  return isDev(name) ? 180 : 731
}

const execAsync = promisify(exec)
try {
  const { stdout: regionsOut } = await execAsync('aws ec2 describe-regions --query "Regions[].RegionName" --output text', { env: process.env })
  await Promise.all(regionsOut.trim().split(/\s+/).map(async (region) => {
    try {
      const { stdout } = await execAsync(`aws logs describe-log-groups --region ${region}`, { env: process.env, maxBuffer: 8 * 1024 * 1024 })
      for (const lg of JSON.parse(stdout).logGroups.filter((l) => !l.retentionInDays)) {
        const days = retentionDaysFor(lg.logGroupName, region)
        await execAsync(`aws logs put-retention-policy --region ${region} --log-group-name "${lg.logGroupName}" --retention-in-days ${days}`, { env: process.env })
        console.log(`retention: set ${days}d on ${region} ${lg.logGroupName}`)
      }
    } catch (e) {
      console.error(`retention sweep failed for ${region}: ${e.message}`) // never blocks the deploy
    }
  }))
} catch (e) {
  console.error(`retention sweep skipped: ${e.message}`)
}
