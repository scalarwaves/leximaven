/* eslint max-len: 0 */
const CFILE = `${process.env.HOME}/.leximaven.noon`
const TFILE = `${process.cwd()}/test/test.config.noon`
const child = require('child_process')
const expect = require('chai').expect
const fs = require('fs-extra')
const noon = require('noon')
const version = require('../package.json').version

describe('command', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    const obj = noon.load(TFILE)
    obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
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
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('anagram', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js anagram -o ${process.cwd()}/test/output/anagram.json ubiquity > test/output/anagram.out`, (err) => {
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
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
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
      child.exec(`node ${process.cwd()}/build/leximaven.js map ubiquity > test/output/map.out`, (err) => {
        const stdout = fs.readFileSync('test/output/map.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\],→ ;:'\?"\(\)-…\/\.√©ĭēˈɪ”]*/mig)
        done(err)
      })
    })
  })
  describe('onelook', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js onelook -o ${process.cwd()}/test/output/onelook.json ubiquity > test/output/onelook.out`, (err) => {
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
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('urban', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js urban -o ${process.cwd()}/test/output/urban.json ubiquity > test/output/urban.out`, (err) => {
        const stdout = fs.readFileSync('test/output/urban.out', 'utf8')
        const obj = {
          type: 'urban',
          source: 'http://www.urbandictionary.com',
          url: 'http://api.urbandictionary.com/v0/define?term=ubiquity',
          definition0: 'Omnipresent; An existence or perceived existence of being everywhere at once.',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/urban.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Definition\]\s[a-z→; \.]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
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

describe('dmuse command', () => {
    before((done) => {
      fs.mkdirpSync('test/output')
      const obj = noon.load(TFILE)
      obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
      obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
      obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
      obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
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
        child.exec(`node ${process.cwd()}/build/leximaven.js dmuse get -o ${process.cwd()}/test/output/dmuse.json ml=ubiquity > test/output/dmuse-get.out`, (err) => {
          const stdout = fs.readFileSync('test/output/dmuse-get.out', 'utf8')
          const obj = {
            type: 'datamuse',
            source: 'http://datamuse.com/api',
            match0: 'ubiquitousness',
            tags1: 'noun',
            match1: 'omnipresence',
            match2: 'pervasiveness',
            tags0: 'noun',
            match3: 'prevalence',
          }
          const json = fs.readJsonSync(`${process.cwd()}/test/output/dmuse.json`)
          expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→\s,]*\/dmuse.json./mig)
          expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
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

describe('config command', () => {
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
    it('shows value of option verbose', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config get verbose > test/output/config-get.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-get.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Option verbose is (true|false)\./mig)
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
        config.rbrain.date.remain = 15000
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Created [\/a-z\.\s]*:\s[ a-z0-9\W]*/mig)
        expect(JSON.stringify(config, null, ' ')).to.equals(JSON.stringify(obj, null, ' '))
        done(err)
      })
    })
  })
  describe('set', () => {
    it('sets value of option verbose to true', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config set verbose false > test/output/config-set.out`, (err) => {
        const stdout = fs.readFileSync('test/output/config-set.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Set option verbose to (true|false)\./mig)
        done(err)
      })
    })
  })
})

describe('rbrain command', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    const obj = noon.load(TFILE)
    obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
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
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain combine -o ${process.cwd()}/test/output/combine.json value > test/output/combine.out`, (err) => {
        const stdout = fs.readFileSync('test/output/combine.out', 'utf8')
        const obj = {
          type: 'portmanteau',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getPortmanteaus&word=value&lang=en&maxResults=5&',
          set0: 'value,united',
          portmanteau0: 'valunited',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/combine.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9,→ -\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('info', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain info -o ${process.cwd()}/test/output/info.json ubiquity > test/output/info.out`, (err) => {
        const stdout = fs.readFileSync('test/output/info.out', 'utf8')
        const obj = {
          type: 'word info',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getWordInfo&word=ubiquity&lang=en&maxResults=undefined&',
          arpabet: 'Y UW0 B IH1 K W IH0 T IY0',
          ipa: 'juˈbɪkwɪti',
          syllables: '4',
          dict: true,
          trusted: true,
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/info.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9 -→ˈɪ\/\.,]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('rhyme', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain rhyme -o ${process.cwd()}/test/output/rhyme.json ubiquity > test/output/rhyme.out`, (err) => {
        const stdout = fs.readFileSync('test/output/rhyme.out', 'utf8')
        const obj = {
          type: 'rhyme',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getRhymes&word=ubiquity&lang=en&maxResults=5&',
          rhyme0: 'stability',
          rhyme1: 'typically',
          rhyme2: 'specifically',
          rhyme3: 'respectively',
          rhyme4: 'effectively',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/rhyme.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Rhymes\]→[a-z*,]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.match(/[\{\}a-z0-9\s:\/\.",]*/mig)
        done(err)
      })
    })
  })
})

describe('wordnik command', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    const obj = noon.load(TFILE)
    obj.dmuse.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.onelook.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.rbrain.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
    obj.wordnik.date.stamp = JSON.stringify(new Date()).replace(/"/mig, '')
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
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik define -o ${process.cwd()}/test/output/define.json ubiquity > test/output/define.out`, (err) => {
        const stdout = fs.readFileSync('test/output/define.out', 'utf8')
        const obj = {
          type: 'definition',
          source: 'http://www.wordnik.com',
          text0: 'Existence or apparent existence everywhere at the same time; omnipresence: "the repetitiveness, the selfsameness, and the ubiquity of modern mass culture”  ( Theodor Adorno ). ',
          deftype0: 'noun',
          source0: 'ahd-legacy',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/define.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→ ;:",\-\(\)\.\/”]*Wrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('example', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik example -o ${process.cwd()}/test/output/example.json ubiquity > test/output/example.out`, (err) => {
        const stdout = fs.readFileSync('test/output/example.out', 'utf8')
        const obj = {
          type: 'example',
          source: 'http://www.wordnik.com',
          example0: 'Both are characterized by their ubiquity and their antiquity: No known human culture lacks them, and musical instruments are among the oldest human artifacts, dating to the Late Pleistocene about 50,000 years ago.',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/example.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\] →:,\.]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('hyphen', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik hyphen -o ${process.cwd()}/test/output/hyphen.json ubiquity > test/output/hyphen.out`, (err) => {
        const stdout = fs.readFileSync('test/output/hyphen.out', 'utf8')
        const obj = {
          type: 'hyphenation',
          source: 'http://www.wordnik.com',
          syllable0: 'u',
          stress1: 'biq',
          syllable2: 'ui',
          syllable3: 'ty',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/hyphen.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Hyphenation\]u-biq-ui-ty\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('origin', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik origin -o ${process.cwd()}/test/output/origin.json ubiquity > test/output/origin.out`, (err) => {
        const stdout = fs.readFileSync('test/output/origin.out', 'utf8')
        const obj = {
          type: 'etymology',
          source: 'http://www.wordnik.com',
          etymology: '[L.  everywhere, fr.  where, perhaps for ,  (cf.  anywhere), and if so akin to E. : cf. F. .]',
          origin: 'ubique, ubi, cubi, quobi, alicubi, who, ubiquit√©',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/origin.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\]→\.,\(\):√©]*Wrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('phrase', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik phrase -o ${process.cwd()}/test/output/phrase.json ubiquitous > test/output/phrase.out`, (err) => {
        const stdout = fs.readFileSync('test/output/phrase.out', 'utf8')
        const obj = {
          type: 'phrase',
          source: 'http://www.wordnik.com',
          agram0: 'ubiquitous',
          bgram0: 'amoeba',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/phrase.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]\-\s]*Wrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('pronounce', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik pronounce -o ${process.cwd()}/test/output/pronounce.json ubiquity > test/output/pronounce.out`, (err) => {
        const stdout = fs.readFileSync('test/output/pronounce.out', 'utf8')
        const obj = {
          type: 'pronunciation',
          source: 'http://www.wordnik.com',
          word: 'ubiquity',
          pronunciation0: '(yo͞o-bĭkˈwĭ-tē)',
          type0: 'ahd-legacy',
          pronunciation1: 'Y UW0 B IH1 K W IH0 T IY0',
          type1: 'arpabet',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/pronounce.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]\(\) \-→ĭēˈ\so͞]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('relate', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik relate -o ${process.cwd()}/test/output/relate.json ubiquity > test/output/relate.out`, (err) => {
        const stdout = fs.readFileSync('test/output/relate.out', 'utf8')
        const obj = {
          type: 'related words',
          source: 'http://www.wordnik.com',
          word: 'ubiquity',
          type0: 'antonym',
          words0: 'uniquity',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/output/relate.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\],\-→]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
})
