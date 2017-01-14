/* eslint max-len: 0, no-useless-escape: 0 */
const themes = require('../themes')
const tools = require('../tools')

const _ = require('lodash')
const chalk = require('chalk')
const noon = require('noon')
const ora = require('ora')
const xray = require('x-ray')

const CFILE = `${process.env.HOME}/.leximaven.noon`
const langs = ['english',
  'english-obscure',
  'german',
  'spanish',
  'esperanto',
  'french',
  'italian',
  'latin',
  'dutch',
  'portuguese',
  'swedish',
  'names']

exports.command = 'anagram <query>'
exports.aliases = ['an']
exports.desc = 'Wordsmith anagrams'
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
  save: {
    alias: 's',
    desc: 'Save flags to config file',
    default: false,
    type: 'boolean',
  },
  case: {
    alias: 'c',
    desc: '0 - lowercase, 1 - First Letter, 2 - UPPERCASE',
    default: 1,
    type: 'number',
  },
  exclude: {
    alias: 'e',
    desc: 'Anagrams must exclude this word',
    default: '',
    type: 'string',
  },
  include: {
    alias: 'i',
    desc: 'Anagrams must include this word',
    default: '',
    type: 'string',
  },
  lang: {
    alias: 'a',
    desc: langs.join(', '),
    default: 'english',
    type: 'string',
  },
  linenum: {
    alias: 'u',
    desc: 'Show line numbers with anagrams',
    default: false,
    type: 'boolean',
  },
  list: {
    alias: 'l',
    desc: 'Show candidate word list only',
    default: false,
    type: 'boolean',
  },
  limit: {
    alias: 't',
    desc: 'Limit number of results',
    default: 10,
    type: 'number',
  },
  minletter: {
    alias: 'n',
    desc: 'Minimum letters in each word',
    default: 1,
    type: 'number',
  },
  maxletter: {
    alias: 'x',
    desc: 'Maximum letters in each word',
    default: 50,
    type: 'number',
  },
  maxword: {
    alias: 'w',
    desc: 'Maximum words in each anagram',
    default: 10,
    type: 'number',
  },
  repeat: {
    alias: 'r',
    desc: 'Repeat occurences of a word OK',
    default: false,
    type: 'boolean',
  },
}
exports.handler = (argv) => {
  tools.checkConfig(CFILE)
  let config = noon.load(CFILE)
  const userConfig = {
    anagram: {
      case: argv.c,
      lang: argv.a,
      linenum: argv.u,
      list: argv.l,
      limit: argv.t,
      minletter: argv.n,
      maxletter: argv.x,
      maxword: argv.w,
      repeat: argv.r,
    },
  }
  if (config.merge) config = _.merge({}, config, userConfig)
  if (argv.s && config.merge) noon.save(CFILE, config)
  if (argv.s && !config.merge) throw new Error("Can't save user config, set option merge to true.")
  const theme = themes.loadTheme(config.theme)
  if (config.verbose) themes.label(theme, 'down', 'Wordsmith')
  const prefix = 'http://wordsmith.org/anagram/anagram.cgi?anagram='
  const query = argv.query
  const uri = `${prefix}${query}`
  const pcont = []
  const repeat = config.anagram.repeat ? 'y' : 'n'
  const list = config.anagram.list ? 'y' : 'n'
  const linenum = config.anagram.linenum ? 'y' : 'n'
  pcont.push(`&language=${config.anagram.lang}`)
  pcont.push(`&t=${config.anagram.limit}`)
  pcont.push(`&d=${config.anagram.maxword}`)
  pcont.push(`&include=${argv.i}`)
  pcont.push(`&exclude=${argv.e}`)
  pcont.push(`&n=${config.anagram.minletter}`)
  pcont.push(`&m=${config.anagram.maxletter}`)
  pcont.push(`&a=${repeat}`)
  pcont.push(`&l=${list}`)
  pcont.push(`&q=${linenum}`)
  pcont.push(`&k=${config.anagram.case}`)
  pcont.push('&src=adv')
  const rest = pcont.join('')
  let url = `${uri}${rest}`
  url = encodeURI(url)
  const tofile = {
    type: 'anagram',
    source: 'http://wordsmith.org/',
    url,
  }
  const ctstyle = _.get(chalk, theme.content.style)
  const spinner = ora({
    text: `${chalk.bold.cyan('Loading anagrams...')}`,
    spinner: 'dots8',
    color: 'yellow',
  })
  spinner.start()
  const x = xray()
  x(url, {
    p: '.p402_premium',
  })((err, block) => {
    spinner.stop()
    spinner.clear()
    if (/Input[a-z0-9 \(\)\.']*/i.test(block.p)) {
      const data = block.p.match(/(Input[a-z0-9 \(\)\.']*)/i)
      let msg = data[1]
      msg = msg.replace(/letters\.Please/i, 'letters.\nPlease')
      console.log(chalk.red(msg))
    } else if (/No anagrams found/i.test(block.p)) {
      console.log(ctstyle('No anagrams found.'))
    } else {
      const data = block.p.match(/(\d*) found\. Displaying ([a-z0-9 ]*):([a-z\s]*)document/i)
      const found = data[1]
      const show = data[2]
      const alist = data[3].trim()
      themes.label(theme, 'down', 'Anagrams')
      console.log(ctstyle(`Anagrams for: ${query}\n${found} found. Displaying ${show}:`))
      console.log(ctstyle(alist))
      tofile.found = found
      tofile.show = show
      tofile.alist = alist.split('\n')
      if (argv.o) tools.outFile(argv.o, argv.f, tofile)
    }
  })
}
