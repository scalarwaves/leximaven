/* eslint max-len:0, no-unused-vars:0 */
const tools = require('../../tools')

const chalk = require('chalk')
const moment = require('moment')
const http = require('good-guy-http')()
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'info'
exports.desc = 'Datamuse metrics'
exports.builder = {}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const url = 'http://api.datamuse.com/metrics'
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = JSON.parse(response.body)
      const version = body[0]
      const qps = body[1]
      const sugf = body[2]
      const sugn = body[3]
      const wordf = body[4]
      const wordn = body[5]
      console.log(chalk.white(`Current queries per second (v${Math.round(version.value * 100) / 100.0}): ${Math.round(qps.value * 100) / 100.0}`))
      console.log(chalk.white(`Latency (/words): ${Math.round(wordf.value * 100000) / 100.0} ms (median), ${Math.round(wordn.value * 100000) / 100.0} ms (99 %ile)`))
      console.log(chalk.white(`Latency (/sug): ${Math.round(sugf.value * 100000) / 100.0} ms (median), ${Math.round(sugn.value * 100000) / 100.0} ms (99 %ile)`))
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
  const limit = config.dmuse.date.limit
  const remain = config.dmuse.date.remain
  const stamp = new Date(config.dmuse.date.stamp)
  const hours = moment(new Date).diff(stamp, 'hours')
  const minutes = moment(new Date).diff(stamp, 'minutes')
  console.log(chalk.white(`${remain}/${limit} requests remain today, will reset in ${23 - hours} hours, ${59 - minutes} minutes.`))
}
