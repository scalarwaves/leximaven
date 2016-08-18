/* eslint max-len: 0 */
const themes = require('../src/themes')
const tools = require('../src/tools')

const _ = require('lodash')
const chalk = require('chalk')
const child = require('child_process')
const expect = require('chai').expect
const fs = require('fs-extra')
const noon = require('noon')
const sinon = require('sinon')
const version = require('../package.json').version
const xml2js = require('xml2js')

const CFILE = `${process.env.HOME}/.leximaven.noon`
const TFILE = `${process.cwd()}/test/test.config.noon`
const spy = sinon.spy(console, 'log')

describe('tools', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    fs.copySync(CFILE, 'test/output/saved.config.noon')
    done()
  })
  beforeEach((done) => {
    spy.reset()
    done()
  })
  after((done) => {
    fs.copySync('test/output/saved.config.noon', CFILE)
    fs.removeSync('test/output')
    done()
  })
  describe('check boolean', () => {
    it('coerces true', (done) => {
      expect(tools.checkBoolean('true')).to.be.true
      done()
    })
    it('coerces false', (done) => {
      expect(tools.checkBoolean('false')).to.be.false
      done()
    })
  })
  describe('check outfile', () => {
    it('json exists', (done) => {
      const obj = { foo: 'bar' }
      const obj2 = { bar: 'foo' }
      tools.outFile('test/output/test.json', false, obj)
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj2))).to.match(/[a-z\/,\-\. ]*/mig)
      const actual = fs.readJsonSync('test/output/test.json')
      expect(actual).to.deep.equal(obj)
      fs.removeSync('test/output/test.json')
      done()
    })
    it("json doesn't exist", (done) => {
      const obj = { foo: 'bar' }
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj))).to.match(/[a-z\/,\-\. ]*/mig)
      fs.removeSync('test/output/test.json')
      done()
    })
    it('xml exists', (done) => {
      const obj = { foo: 'bar' }
      tools.outFile('test/output/test.xml', false, obj)
      tools.outFile('test/output/test.xml', false, obj)
      done()
    })
    it('enforces supported formats', (done) => {
      const obj = { foo: 'bar' }
      try {
        tools.outFile('test/output/test.foo', false, obj)
      } catch (error) {
        console.log(error)
        done()
      }
    })
  })
  describe('check config', () => {
    it('config exists', (done) => {
      fs.copySync('test/output/saved.config.noon', CFILE)
      expect(tools.checkConfig(CFILE)).to.be.true
      done()
    })
    it("config doesn't exist", (done) => {
      fs.removeSync(CFILE)
      try {
        tools.checkConfig(CFILE)
      } catch (error) {
        console.log(error)
        done()
      }
    })
  })
  describe('array to string', () => {
    const array = ['enclosed string']
    const string = 'normal string'
    it('extracts string from array', (done) => {
      expect(tools.arrToStr(array)).to.equals('enclosed string')
      done()
    })
    it('returns string when not enclosed', (done) => {
      expect(tools.arrToStr(string)).to.equals('normal string')
      done()
    })
  })
  describe('rate-limiting', () => {
    it('resets datamuse limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.dmuse.date.stamp = new Date().toJSON().replace(/2016/, '2015')
      config.dmuse.date.remain = 99998
      const checkStamp = tools.limitDmuse(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.dmuse.date.remain).to.equals(99999)
      expect(c.dmuse.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(true)
      done()
    })
    it('decrements datamuse limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.dmuse.date.stamp = new Date().toJSON()
      config.dmuse.date.remain = 100000
      const checkStamp = tools.limitDmuse(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.dmuse.date.remain).to.equals(99999)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(false)
      done()
    })
    it('reaches datamuse limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.dmuse.date.stamp = new Date().toJSON()
      config.dmuse.date.remain = 0
      const checkStamp = tools.limitDmuse(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.dmuse.date.remain).to.equals(0)
      expect(proceed).to.equals(false)
      expect(reset).to.equals(false)
      done()
    })
    it('resets onelook limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.onelook.date.stamp = new Date().toJSON().replace(/2016/, '2015')
      config.onelook.date.remain = 9998
      const checkStamp = tools.limitOnelook(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.onelook.date.remain).to.equals(9999)
      expect(c.onelook.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(true)
      done()
    })
    it('decrements onelook limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.onelook.date.stamp = new Date().toJSON()
      config.onelook.date.remain = 10000
      const checkStamp = tools.limitOnelook(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.onelook.date.remain).to.equals(9999)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(false)
      done()
    })
    it('reaches onelook limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.onelook.date.stamp = new Date().toJSON()
      config.onelook.date.remain = 0
      const checkStamp = tools.limitOnelook(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.onelook.date.remain).to.equals(0)
      expect(proceed).to.equals(false)
      expect(reset).to.equals(false)
      done()
    })
    it('resets rhymebrain limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.rbrain.date.stamp = new Date().toJSON().replace(/2016/, '2015')
      config.rbrain.date.remain = 348
      const checkStamp = tools.limitRbrain(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.rbrain.date.remain).to.equals(349)
      expect(c.rbrain.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(true)
      done()
    })
    it('decrements rhymebrain limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.rbrain.date.stamp = new Date().toJSON()
      config.rbrain.date.remain = 350
      const checkStamp = tools.limitRbrain(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.rbrain.date.remain).to.equals(349)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(false)
      done()
    })
    it('reaches rhymebrain limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.rbrain.date.stamp = new Date().toJSON()
      config.rbrain.date.remain = 0
      const checkStamp = tools.limitRbrain(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.rbrain.date.remain).to.equals(0)
      expect(proceed).to.equals(false)
      expect(reset).to.equals(false)
      done()
    })
    it('resets wordnik limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.wordnik.date.stamp = new Date().toJSON().replace(/2016/, '2015')
      config.wordnik.date.remain = 14998
      const checkStamp = tools.limitWordnik(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.wordnik.date.remain).to.equals(14999)
      expect(c.wordnik.date.stamp).to.match(/2016[\-\d]*T[0-9:\.\-Z]*/mig)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(true)
      done()
    })
    it('decrements wordnik limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.wordnik.date.stamp = new Date().toJSON()
      config.wordnik.date.remain = 15000
      const checkStamp = tools.limitWordnik(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.wordnik.date.remain).to.equals(14999)
      expect(proceed).to.equals(true)
      expect(reset).to.equals(false)
      done()
    })
    it('reaches wordnik limit', (done) => {
      fs.copySync('test/test.config.noon', CFILE)
      const config = noon.load(CFILE)
      config.wordnik.date.stamp = new Date().toJSON()
      config.wordnik.date.remain = 0
      const checkStamp = tools.limitWordnik(config)
      const c = checkStamp[0]
      const proceed = checkStamp[1]
      const reset = checkStamp[2]
      expect(c.wordnik.date.remain).to.equals(0)
      expect(proceed).to.equals(false)
      expect(reset).to.equals(false)
      done()
    })
  })
})

describe('themes', () => {
  beforeEach(() => {
    spy.reset()
  })
  after(() => spy.restore())
  describe('get themes', () => {
    it('returns an array of theme names', (done) => {
      const list = themes.getThemes().sort()
      const obj = ['colonel', 'markup', 'square']
      expect(list).to.deep.equal(obj)
      done()
    })
  })
  describe('load theme', () => {
    it('returns a theme', (done) => {
      const theme = themes.loadTheme('square')
      const obj = {
        prefix: {
          str: '[',
          style: 'bold.green',
        },
        text: {
          style: 'bold.white',
        },
        content: {
          style: 'white',
        },
        suffix: {
          str: ']',
          style: 'bold.green',
        },
        connector: {
          str: '→',
          style: 'bold.cyan',
        },
      }
      expect(theme).to.deep.equal(obj)
      done()
    })
  })
  describe('labels', () => {
    const theme = themes.loadTheme('square')
    const text = 'label'
    it('labels right', (done) => {
      const content = 'right'
      expect(spy.calledWith(themes.label(theme, 'right', text, content))).to.be.true
      done()
    })
    it('labels down', (done) => {
      const content = 'down'
      expect(spy.calledWith(themes.label(theme, 'down', text, content))).to.be.true
      done()
    })
    it('labels without content', (done) => {
      expect(spy.calledWith(themes.label(theme, 'right', text))).to.be.true
      done()
    })
    it('enforces right or down', (done) => {
      try {
        themes.label(theme, 'err', 'label')
      } catch (error) {
        console.log(error)
        done()
      }
    })
  })
})

describe('config commands', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    fs.copySync(CFILE, 'test/output/saved.config.noon')
    done()
  })
  after((done) => {
    fs.copySync('test/output/saved.config.noon', CFILE)
    fs.removeSync('test/output')
    done()
  })
  describe('get', () => {
    it('shows value of option onelook.links', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config get onelook.links > test/output/config-get.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-get.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Option onelook.links is (true|false)\./mig)
        done(err)
      })
    })
  })
  describe('init', () => {
    before((done) => {
      fs.removeSync(CFILE)
      done()
    })
    it('creates the config file', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config init > test/output/config-init.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-init.out', 'utf8')
        const config = noon.load(CFILE)
        const obj = {
          anagram: {
            case: 1,
            lang: 'english',
            limit: 10,
            linenum: false,
            list: false,
            maxletter: 50,
            maxword: 10,
            minletter: 1,
            repeat: false,
          },
          dmuse: {
            date: {
              interval: 'day',
              limit: 100000,
              remain: 100000,
              stamp: '',
            },
            max: 5,
          },
          merge: true,
          onelook: {
            date: {
              interval: 'day',
              limit: 10000,
              remain: 10000,
              stamp: '',
            },
            links: false,
          },
          rbrain: {
            combine: {
              lang: 'en',
              max: 5,
            },
            date: {
              interval: 'hour',
              limit: 350,
              remain: 350,
              stamp: '',
            },
            info: {
              lang: 'en',
            },
            rhyme: {
              lang: 'en',
              max: 50,
            },
          },
          theme: 'square',
          urban: {
            limit: 5,
          },
          usage: true,
          verbose: false,
          wordmap: {
            limit: 1,
          },
          wordnik: {
            date: {
              interval: 'hour',
              limit: 15000,
              remain: 15000,
              stamp: '',
            },
            define: {
              canon: false,
              defdict: 'all',
              limit: 5,
              part: '',
            },
            example: {
              canon: false,
              limit: 5,
              skip: 0,
            },
            hyphen: {
              canon: false,
              dict: 'all',
              limit: 5,
            },
            origin: {
              canon: false,
            },
            phrase: {
              canon: false,
              limit: 5,
              weight: 13,
            },
            pronounce: {
              canon: false,
              dict: '',
              limit: 5,
              type: '',
            },
            relate: {
              canon: false,
              limit: 10,
              type: '',
            },
          },
        }
        config.dmuse.date.stamp = ''
        config.dmuse.date.remain = 100000
        config.onelook.date.stamp = ''
        config.onelook.date.remain = 10000
        config.rbrain.date.stamp = ''
        config.rbrain.date.remain = 350
        config.wordnik.date.stamp = ''
        config.wordnik.date.remain = 15000
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Created [a-z\/\.]*/mig)
        expect(config).to.deep.equal(obj)
        done(err)
      })
    })
    it('force overwrites existing and prints config', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config init -f -v > test/output/config-init.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-init.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \/\.\[\]:\-\s|]*/mig)
        done(err)
      })
    })
  })
  describe('set', () => {
    it('sets value of option onelook.links to false', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config set onelook.links false > test/output/config-set.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-set.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Set option onelook.links to (true|false)\./mig)
        done(err)
      })
    })
  })
})

describe('dmuse commands', () => {
    before((done) => {
      fs.mkdirpSync('test/output')
      const obj = noon.load(TFILE)
      obj.dmuse.date.stamp = new Date().toJSON()
      obj.onelook.date.stamp = new Date().toJSON()
      obj.rbrain.date.stamp = new Date().toJSON()
      obj.wordnik.date.stamp = new Date().toJSON()
      let fileExists = null
      try {
        fs.statSync(CFILE)
        fileExists = true
      } catch (e) {
        if (e.code === 'ENOENT') {
          fileExists = false
        }
      }
      if (fileExists) {
        const config = noon.load(CFILE)
        obj.dmuse.date.stamp = config.dmuse.date.stamp
        obj.dmuse.date.remain = config.dmuse.date.remain
        obj.onelook.date.stamp = config.onelook.date.stamp
        obj.onelook.date.remain = config.onelook.date.remain
        obj.rbrain.date.stamp = config.rbrain.date.stamp
        obj.rbrain.date.remain = config.rbrain.date.remain
        obj.wordnik.date.stamp = config.wordnik.date.stamp
        obj.wordnik.date.remain = config.wordnik.date.remain
        fs.copySync(CFILE, 'test/output/saved.config.noon')
      }
      noon.save(CFILE, obj)
      done()
    })
    after((done) => {
      let fileExists = null
      try {
        fs.statSync('test/output/saved.config.noon')
        fileExists = true
      } catch (e) {
        if (e.code === 'ENOENT') {
          fileExists = false
        }
      }
      if (fileExists) {
        fs.removeSync(CFILE)
        fs.copySync('test/output/saved.config.noon', CFILE)
      } else {
        fs.removeSync(CFILE)
      }
      fs.removeSync('test/output')
      done()
    })
    describe('get', () => {
      it('shows output', (done) => {
        child.exec(`node ${process.cwd()}/build/leximaven.js dmuse get -s -o ${process.cwd()}/test/output/dmuse.json ml=ubiquity > test/output/dmuse-get.out`, (err) => {
          const stdout = fs.readFileSync('test/output/dmuse-get.out', 'utf8')
          const obj = {
            type: 'datamuse',
            source: 'http://datamuse.com/api',
            url: 'http://api.datamuse.com/words?max=5&&ml=ubiquity&dmuse&get',
            match0: 'ubiquitousness',
            tags1: 'noun',
            match1: 'omnipresence',
            match2: 'pervasiveness',
            tags0: 'noun',
            match3: 'prevalence',
          }
          const json = fs.readJsonSync(`${process.cwd()}/test/output/dmuse.json`)
          expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→\s,]*\/dmuse.json./mig)
          expect(json).to.deep.equal(obj)
          done(err)
        })
      })
    })
    describe('info', () => {
      it('shows metrics', (done) => {
        child.exec(`node ${process.cwd()}/build/leximaven.js dmuse info > test/output/dmuse-info.out`, err => {
          const stdout = fs.readFileSync('test/output/dmuse-info.out', 'utf8')
          expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\/ ,\.]*\s[\w ]*\(v\d\): \d*.\d*\s[\w \(\/\):\.,%]*\s[\w \(\/\):\.,%]*/)
          done(err)
        })
      })
    })
})

describe('rbrain commands', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    const obj = noon.load(TFILE)
    obj.dmuse.date.stamp = new Date().toJSON()
    obj.onelook.date.stamp = new Date().toJSON()
    obj.rbrain.date.stamp = new Date().toJSON()
    obj.wordnik.date.stamp = new Date().toJSON()
    let fileExists = null
    try {
      fs.statSync(CFILE)
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      const config = noon.load(CFILE)
      obj.dmuse.date.stamp = config.dmuse.date.stamp
      obj.dmuse.date.remain = config.dmuse.date.remain
      obj.onelook.date.stamp = config.onelook.date.stamp
      obj.onelook.date.remain = config.onelook.date.remain
      obj.rbrain.date.stamp = config.rbrain.date.stamp
      obj.rbrain.date.remain = config.rbrain.date.remain
      obj.wordnik.date.stamp = config.wordnik.date.stamp
      obj.wordnik.date.remain = config.wordnik.date.remain
      fs.copySync(CFILE, 'test/output/saved.config.noon')
    }
    noon.save(CFILE, obj)
    done()
  })
  after((done) => {
    let fileExists = null
    try {
      fs.statSync('test/output/saved.config.noon')
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE)
      fs.copySync('test/output/saved.config.noon', CFILE)
    } else {
      fs.removeSync(CFILE)
    }
    fs.removeSync('test/output')
    done()
  })
  describe('combine', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain combine -s -m1 -o ${process.cwd()}/test/output/combine.json value > test/output/combine.out`, (err) => {
        const stdout = fs.readFileSync('test/output/combine.out', 'utf8')
        const obj = {
          type: 'portmanteau',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getPortmanteaus&word=value&lang=en&maxResults=1&',
          set0: 'value,unique',
          portmanteau0: 'valunique',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/combine.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9,→ -\/\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('info', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain info -s -o ${process.cwd()}/test/output/info.json fuck > test/output/info.out`, (err) => {
        const stdout = fs.readFileSync('test/output/info.out', 'utf8')
        const obj = {
          type: 'word info',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getWordInfo&word=fuck&lang=en',
          arpabet: 'F AH1 K',
          ipa: 'ˈfʌk',
          syllables: '1',
          offensive: true,
          dict: true,
          trusted: true,
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/info.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9 -→ˈʌ\/\.,]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('rhyme', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain rhyme -s -m1 -o ${process.cwd()}/test/output/rhyme.json too > test/output/rhyme.out`, (err) => {
        const stdout = fs.readFileSync('test/output/rhyme.out', 'utf8')
        const obj = {
          type: 'rhyme',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getRhymes&word=too&lang=en&maxResults=1&',
          rhyme0: 'to',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/rhyme.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Rhymes\]→[a-z*, ]*\sWrote data to [a-z\/\.]*\s\d*\/\d*[a-z0-9 ,\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
})

describe('wordnik commands', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    const obj = noon.load(TFILE)
    obj.dmuse.date.stamp = new Date().toJSON()
    obj.onelook.date.stamp = new Date().toJSON()
    obj.rbrain.date.stamp = new Date().toJSON()
    obj.wordnik.date.stamp = new Date().toJSON()
    let fileExists = null
    try {
      fs.statSync(CFILE)
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      const config = noon.load(CFILE)
      obj.dmuse.date.stamp = config.dmuse.date.stamp
      obj.dmuse.date.remain = config.dmuse.date.remain
      obj.onelook.date.stamp = config.onelook.date.stamp
      obj.onelook.date.remain = config.onelook.date.remain
      obj.rbrain.date.stamp = config.rbrain.date.stamp
      obj.rbrain.date.remain = config.rbrain.date.remain
      obj.wordnik.date.stamp = config.wordnik.date.stamp
      obj.wordnik.date.remain = config.wordnik.date.remain
      fs.copySync(CFILE, 'test/output/saved.config.noon')
    }
    noon.save(CFILE, obj)
    done()
  })
  after((done) => {
    let fileExists = null
    try {
      fs.statSync('test/output/saved.config.noon')
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE)
      fs.copySync('test/output/saved.config.noon', CFILE)
    } else {
      fs.removeSync(CFILE)
    }
    fs.removeSync('test/output')
    done()
  })
  describe('define', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik define -s -l1 -o ${process.cwd()}/test/output/define.json ubiquity > test/output/define.out`, (err) => {
        const stdout = fs.readFileSync('test/output/define.out', 'utf8')
        const obj = {
          type: 'definition',
          source: 'http://www.wordnik.com',
          url: `http://api.wordnik.com:80/v4/word.json/ubiquity/definitions?useCanonical=false&sourceDictionaries=all&includeRelated=false&includeTags=false&limit=1&partOfSpeech=&api_key=${process.env.WORDNIK}`,
          text0: 'Existence or apparent existence everywhere at the same time; omnipresence: "the repetitiveness, the selfsameness, and the ubiquity of modern mass culture”  ( Theodor Adorno ). ',
          deftype0: 'noun',
          source0: 'ahd-legacy',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/define.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→ ;:",\-\(\)\.\/”]*Wrote data to [a-z\/\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('example', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik example -s -l1 -o ${process.cwd()}/test/output/example.json ubiquity > test/output/example.out`, (err) => {
        const stdout = fs.readFileSync('test/output/example.out', 'utf8')
        const obj = {
          type: 'example',
          source: 'http://www.wordnik.com',
          url: `http://api.wordnik.com:80/v4/word.json/ubiquity/examples?useCanonical=false&includeDuplicates=false&limit=1&skip=0&api_key=${process.env.WORDNIK}`,
          example0: 'Both are characterized by their ubiquity and their antiquity: No known human culture lacks them, and musical instruments are among the oldest human artifacts, dating to the Late Pleistocene about 50,000 years ago.',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/example.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\] →:,\.]*\sWrote data to [a-z\/\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('hyphen', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik hyphen -s -o ${process.cwd()}/test/output/hyphen.json ubiquity > test/output/hyphen.out`, (err) => {
        const stdout = fs.readFileSync('test/output/hyphen.out', 'utf8')
        const obj = {
          type: 'hyphenation',
          source: 'http://www.wordnik.com',
          url: `http://api.wordnik.com:80/v4/word.json/ubiquity/hyphenation?useCanonical=false&limit=5&api_key=${process.env.WORDNIK}`,
          syllable0: 'u',
          stress1: 'biq',
          syllable2: 'ui',
          syllable3: 'ty',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/hyphen.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Hyphenation\]→[a-z\-]*\sWrote data to [a-z\/\.]*\s\d*\/\d*[a-z0-9 ,\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('origin', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik origin -s -o ${process.cwd()}/test/output/origin.json ubiquity > test/output/origin.out`, (err) => {
        const stdout = fs.readFileSync('test/output/origin.out', 'utf8')
        const obj = {
          type: 'etymology',
          source: 'http://www.wordnik.com',
          url: `http://api.wordnik.com:80/v4/word.json/ubiquity/etymologies?useCanonical=false&api_key=${process.env.WORDNIK}`,
          etymology: '[L.  everywhere, fr.  where, perhaps for ,  (cf.  anywhere), and if so akin to E. : cf. F. .]',
          origin: 'ubique, ubi, cubi, quobi, alicubi, who, ubiquit√©',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/origin.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\]→\.,\(\):√©]*Wrote data to [a-z\/\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('phrase', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik phrase -s -l1 -o ${process.cwd()}/test/output/phrase.json ubiquitous > test/output/phrase.out`, (err) => {
        const stdout = fs.readFileSync('test/output/phrase.out', 'utf8')
        const obj = {
          type: 'phrase',
          source: 'http://www.wordnik.com',
          url: `http://api.wordnik.com:80/v4/word.json/ubiquitous/phrases?useCanonical=false&limit=1&wlmi=13&api_key=${process.env.WORDNIK}`,
          agram0: 'ubiquitous',
          bgram0: 'amoeba',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/phrase.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]\-\s]*Wrote data to [a-z\/\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('pronounce', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik pronounce -s -o ${process.cwd()}/test/output/pronounce.json ubiquity > test/output/pronounce.out`, (err) => {
        const stdout = fs.readFileSync('test/output/pronounce.out', 'utf8')
        const obj = {
          type: 'pronunciation',
          source: 'http://www.wordnik.com',
          url: `http://api.wordnik.com:80/v4/word.json/ubiquity/pronunciations?useCanonical=false&limit=5&api_key=${process.env.WORDNIK}`,
          word: 'ubiquity',
          pronunciation0: '(yo͞o-bĭkˈwĭ-tē)',
          type0: 'ahd-legacy',
          pronunciation1: 'Y UW0 B IH1 K W IH0 T IY0',
          type1: 'arpabet',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/pronounce.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]\(\) \-→ĭēˈ\so͞]*\sWrote data to [a-z\/\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('relate', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik relate -s -l1 -o ${process.cwd()}/test/output/relate.json ubiquity > test/output/relate.out`, (err) => {
        const stdout = fs.readFileSync('test/output/relate.out', 'utf8')
        const obj = {
          type: 'related words',
          source: 'http://www.wordnik.com',
          url: `http://api.wordnik.com:80/v4/word.json/ubiquity/relatedWords?useCanonical=false&limitPerRelationshipType=1&api_key=${process.env.WORDNIK}`,
          word: 'ubiquity',
          type0: 'antonym',
          words0: 'uniquity',
          type1: 'hypernym',
          words1: 'presence',
          type2: 'cross-reference',
          words2: 'ubiquity of the king',
          type3: 'synonym',
          words3: 'omnipresence',
          type4: 'rhyme',
          words4: 'iniquity',
          type5: 'same-context',
          words5: 'omnipresence'
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/relate.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\],\-→]*\sWrote data to [a-z\/\.]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
})

describe('root commands', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    const obj = noon.load(TFILE)
    obj.dmuse.date.stamp = new Date().toJSON()
    obj.onelook.date.stamp = new Date().toJSON()
    obj.rbrain.date.stamp = new Date().toJSON()
    obj.wordnik.date.stamp = new Date().toJSON()
    let fileExists = null
    try {
      fs.statSync(CFILE)
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      const config = noon.load(CFILE)
      obj.dmuse.date.stamp = config.dmuse.date.stamp
      obj.dmuse.date.remain = config.dmuse.date.remain
      obj.onelook.date.stamp = config.onelook.date.stamp
      obj.onelook.date.remain = config.onelook.date.remain
      obj.rbrain.date.stamp = config.rbrain.date.stamp
      obj.rbrain.date.remain = config.rbrain.date.remain
      obj.wordnik.date.stamp = config.wordnik.date.stamp
      obj.wordnik.date.remain = config.wordnik.date.remain
      fs.copySync(CFILE, 'test/output/saved.config.noon')
      noon.save(CFILE, obj)
    } else {
      noon.save(CFILE, obj)
    }
    done()
  })
  after((done) => {
    let fileExists = null
    try {
      fs.statSync('test/output/saved.config.noon')
      fileExists = true
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE)
      fs.copySync('test/output/saved.config.noon', CFILE)
    } else {
      fs.removeSync(CFILE)
    }
    fs.removeSync('test/output')
    done()
  })
  describe('acronym', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js acronym -o ${process.cwd()}/test/output/acronym.json DDC > test/output/acronym.out`, (err) => {
        const stdout = fs.readFileSync('test/output/acronym.out', 'utf8')
        const json = fs.readJsonSync(`${process.cwd()}/test/output/acronym.json`)
        const obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387',
        }
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Found \d* acronyms for [a-z]*:\s[a-z0-9\s-:\/\.|(|)]*Wrote data to [a-z\/]*.json./mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
    it('forces writing json', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js acronym -f -o ${process.cwd()}/test/output/acronym.json DDC > test/output/acronym.out`, (err) => {
        const stdout = fs.readFileSync('test/output/acronym.out', 'utf8')
        const json = fs.readJsonSync(`${process.cwd()}/test/output/acronym.json`)
        const obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387',
        }
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Found \d* acronyms for [a-z]*:\s[a-z0-9\s-:\/\.|(|)]*Overwrote [a-z\/\.]* with data./mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
    it('writes xml', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js acronym -o ${process.cwd()}/test/output/acronym.xml DDC`, (err) => {
        const obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387',
        }
        const xml = fs.readFileSync(`${process.cwd()}/test/output/acronym.xml`, 'utf8')
        const parser = new xml2js.Parser()
        parser.parseString(xml, (err, result) => {
          let fixed = result.root
          fixed.type = fixed.type[0]
          fixed.source = fixed.source[0]
          fixed.url = fixed.url[0]
          fixed.expansion0 = fixed.expansion0[0]
          fixed.expansion1 = fixed.expansion1[0]
          fixed.expansion2 = fixed.expansion2[0]
          fixed.expansion3 = fixed.expansion3[0]
          fixed.expansion4 = fixed.expansion4[0]
          fixed.url0 = fixed.url0[0]
          fixed.comment0 = fixed.comment0[0]
          fixed.comment4 = fixed.comment4[0]
          fixed.DDC0 = fixed.DDC0[0]
          fixed.DDC1 = fixed.DDC1[0]
          fixed.DDC2 = fixed.DDC2[0]
          fixed.DDC3 = fixed.DDC3[0]
          fixed.DDC4 = fixed.DDC4[0]
          expect(fixed).to.deep.equal(obj)
          done(err)
        })
      })
    })
    it('forces writing xml', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js acronym -f -o ${process.cwd()}/test/output/acronym.xml DDC`, (err) => {
        const obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387',
        }
        const xml = fs.readFileSync(`${process.cwd()}/test/output/acronym.xml`, 'utf8')
        const parser = new xml2js.Parser()
        parser.parseString(xml, (err, result) => {
          let fixed = result.root
          fixed.type = fixed.type[0]
          fixed.source = fixed.source[0]
          fixed.url = fixed.url[0]
          fixed.expansion0 = fixed.expansion0[0]
          fixed.expansion1 = fixed.expansion1[0]
          fixed.expansion2 = fixed.expansion2[0]
          fixed.expansion3 = fixed.expansion3[0]
          fixed.expansion4 = fixed.expansion4[0]
          fixed.url0 = fixed.url0[0]
          fixed.comment0 = fixed.comment0[0]
          fixed.comment4 = fixed.comment4[0]
          fixed.DDC0 = fixed.DDC0[0]
          fixed.DDC1 = fixed.DDC1[0]
          fixed.DDC2 = fixed.DDC2[0]
          fixed.DDC3 = fixed.DDC3[0]
          fixed.DDC4 = fixed.DDC4[0]
          expect(fixed).to.deep.equal(obj)
          done(err)
        })
      })
    })
  })
  describe('anagram', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js anagram -s -o ${process.cwd()}/test/output/anagram.json ubiquity > test/output/anagram.out`, (err) => {
        const stdout = fs.readFileSync('test/output/anagram.out', 'utf8')
        const json = fs.readJsonSync(`${process.cwd()}/test/output/anagram.json`)
        const obj = {
          type: 'anagram',
          source: 'http://wordsmith.org/',
          url: 'http://wordsmith.org/anagram/anagram.cgi?anagram=ubiquity&language=english&t=10&d=10&include=&exclude=&n=1&m=50&a=n&l=n&q=n&k=1&src=adv',
          found: '2',
          show: 'all',
          alist: [
            'Ubiquity',
            'Buy I Quit',
          ],
        }
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[Anagrams\]\sAnagrams for: [a-z]*\s\d* found. Displaying all:\s[a-z\/\.\s]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
    it('handles too long input', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js anagram johnjacobjingleheimerschmidtthatsmynametoo > test/output/anagram.out`, (err) => {
        const stdout = fs.readFileSync('test/output/anagram.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Input[a-z0-9 \(\)\.']*\s[a-z \.]*/mig)
        done(err)
      })
    })
    it('handles no found anagrams', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js anagram bcdfghjklmnpqrstvwxz > test/output/anagram.out`, (err) => {
        const stdout = fs.readFileSync('test/output/anagram.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/No anagrams found\./mig)
        done(err)
      })
    })
  })
  describe('comp', () => {
    it('outputs shell completion script', (done) => {
      child.exec(`node ${__dirname}/../build/leximaven.js comp > test/output/comp.out`, (err) => {
        const stdout = fs.readFileSync('test/output/comp.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[#\-a-z0-9\.\s:\/>~_\(\)\{\}\[\]="$@,;]*/mig)
        done(err)
      })
    })
  })
  describe('help', () => {
    it('shows usage', (done) => {
      child.exec(`node ${__dirname}/../build/leximaven.js --help > test/output/help.out`, (err) => {
        const stdout = fs.readFileSync('test/output/help.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[_ \/\(\)\-\\'`|,\s]*\s*Usage:\s[a-z \/\.<>\[\]]*\s*Commands:\s[ a-z<>\s]*:\s[ \-a-z,\[\]\s]*\[boolean\]\s*/mig)
        done(err)
      })
    })
  })
  describe('ls', () => {
    it('demonstrates installed themes', (done) => {
      child.exec(`node ${__dirname}/../build/leximaven.js ls > test/output/ls.out`, (err) => {
        const stdout = fs.readFileSync('test/output/ls.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z :|,.<>\-\[\]→]*/mig)
        done(err)
      })
    })
  })
  describe('map', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js map -s ubiquity > test/output/map.out`, (err) => {
        const stdout = fs.readFileSync('test/output/map.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\],→ ;:'\?"\(\)-…\/\.√©ĭēˈɪ”]*/mig)
        done(err)
      })
    })
  })
  describe('onelook', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js onelook -s -o ${process.cwd()}/test/output/onelook.json ubiquity > test/output/onelook.out`, (err) => {
        const stdout = fs.readFileSync('test/output/onelook.out', 'utf8')
        const obj = {
          type: 'onelook',
          source: 'http://www.onelook.com',
          url: 'http://onelook.com/?xml=1&w=ubiquity',
          definition: 'noun: the state of being everywhere at once (or seeming to be everywhere at once)',
          phrase: 'ubiquity records',
          sim: 'omnipresence,ubiquitousness',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/onelook.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]:\(\)→ \/\.,]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
    it('provides resource links', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js onelook -l ubiquity > test/output/onelook.out`, (err) => {
        const stdout = fs.readFileSync('test/output/onelook.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]:\(\)→ \/\.,]*\s\[Resources\]\s[a-z0-9 \s\[\]→:\/\._#\?=\-',&%\(\)\+]*/mig)
        done(err)
      })
    })
  })
  describe('urban', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js urban -s -l1 -o ${process.cwd()}/test/output/urban.json flip the bird > test/output/urban.out`, (err) => {
        const stdout = fs.readFileSync('test/output/urban.out', 'utf8')
        const obj = {
          type: 'urban',
          source: 'http://www.urbandictionary.com',
          url: 'http://api.urbandictionary.com/v0/define?term=flip+the+bird',
          definition0: '1. The act of rotating an avian creature through more than 90 degrees.\r\n\r\n2. The act of extending the central digit of the hand with the intent to cause offense.',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/urban.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \[\]→\.\/\s]*/mig)
        expect(json).to.deep.equal(obj)
        done(err)
      })
    })
  })
  describe('version', () => {
    it('prints the version number', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js --version`, (err, stdout) => {
        expect(stdout).to.contain(version)
        done(err)
      })
    })
  })
})
