const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const chalk = require('chalk')
const http = require('good-guy-http')()
const noon = require('noon')
const xml2js = require('xml2js')

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
  if (config.verbose) themes.label(theme, 'down', 'Acronyms')
  const acronym = argv.acronym.toUpperCase()
  const url = `http://acronyms.silmaril.ie/cgi-bin/xaa?${argv.acronym}`
  const tofile = {
    type: 'acronym',
    source: 'http://acronyms.silmaril.ie',
    url,
  }
  const ctstyle = _.get(chalk, theme.content.style)
  http({ url }, (error, response) => {
    if (!error && response.statusCode === 200) {
      const body = response.body
      const parser = new xml2js.Parser()
      parser.parseString(body, (err, result) => {
        const found = result.acronym.found[0]
        const count = found.$
        if (count.n === '0') {
          console.log(ctstyle(`Found 0 acronyms for ${acronym}.`))
        } else {
          console.log(ctstyle(`Found ${count.n} acronyms for ${acronym}:`))
          const list = found.acro
          for (let i = 0; i <= list.length - 1; i++) {
            const item = list[i]
            process.stdout.write(ctstyle(`${item.expan}`))
            tofile[[`expansion${i}`]] = item.expan[0]
            const comm = item.comment[0]
            if (comm !== '') {
              if (comm.a) {
                const comment = comm.a[0]
                process.stdout.write(ctstyle(` - ${comment._} - ${comment.$.href}`))
                tofile[[`comment${i}`]] = comment._
                tofile[[`url${i}`]] = comment.$.href
              } else {
                process.stdout.write(ctstyle(` - ${comm}`))
                tofile[[`comment${i}`]] = item.comment[0]
              }
            }
            console.log(ctstyle(` - DDC: ${item.$.dewey}`))
            tofile[[`DDC${i}`]] = item.$.dewey
          }
          if (argv.o) tools.outFile(argv.o, argv.f, tofile)
        }
      })
    } else {
      throw new Error(`HTTP ${error.statusCode}: ${error.reponse.body}`)
    }
  })
}
