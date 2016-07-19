const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const chalk = require('chalk')
const needle = require('needle')
const noon = require('noon')

const CFILE = `${process.env.HOME}/.leximaven.noon`

exports.command = 'acronym <acronym>'
exports.desc = 'Acronyms'
exports.builder = {
  out: {
    alias: 'o',
    desc: 'Write cson, json, noon, plist, yaml, xml',
    default: '',
    type: 'string',
  },
  force: {
    alias: 'f',
    desc: 'Force overwriting outfile',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  const config = noon.load(CFILE)
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.labelDown('Acronyms', theme, null)
  const acronym = argv.acronym.toUpperCase()
  const url = `http://acronyms.silmaril.ie/cgi-bin/xaa?${argv.acronym}`
  const tofile = {
    type: 'acronym',
    source: 'http://acronyms.silmaril.ie',
    url,
  }
  const ctstyle = _.get(chalk, theme.content.style)
  needle.get(url, (error, response) => {
    if (!error && response.statusCode === 200) {
      const resp = response.body
      if (resp.acronym.found.$.n === '0') {
        console.log(ctstyle(`Found 0 acronyms for ${acronym}.`))
      } else {
        const found = resp.acronym.found
        console.log(ctstyle(`Found ${found.$.n} acronyms for ${acronym}:`))
        const list = found.acro
        for (let i = 0; i <= list.length - 1; i++) {
          const item = list[i]
          process.stdout.write(ctstyle(`${item.expan}`))
          tofile[[`expansion${i}`]] = item.expan
          if (item.comment !== '') {
            if (item.comment.a) {
              const comment = item.comment.a
              process.stdout.write(ctstyle(` - ${comment._} - ${comment.$.href}`))
              tofile[[`comment${i}`]] = comment._
              tofile[[`url${i}`]] = comment.$.href
            } else {
              process.stdout.write(ctstyle(` - ${item.comment}`))
              tofile[[`comment${i}`]] = item.comment
            }
          }
          console.log(ctstyle(` - DDC: ${item.$.dewey}`))
          tofile[[`DDC${i}`]] = item.$.dewey
        }
        if (argv.o) tools.outFile(argv.o, argv.f, tofile)
      }
    } else {
      console.error(`${chalk.red.bold(`HTTP ${response.statusCode}:`)} ${chalk.red(error)}`)
    }
  })
}
