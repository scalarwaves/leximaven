/* eslint max-len: 0 */
const CFILE = `${process.env.HOME}/.leximaven.noon`
const child = require('child_process')
const expect = require('chai').expect
const fs = require('fs-extra')
const noon = require('noon')
const path = require('path')
const version = require('../package.json').version

describe('command', () => {
  // before((done) => {
  //   fs.mkdirpSync('test/output')
  //   done()
  // })
  // after((done) => {
  //   fs.removeSync('test/output')
  //   done()
  // })
  describe('acronym', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js acronym -o ${process.cwd()}/test/acronym.json DDC > test/acronym.out`, (err) => {
        const stdout = fs.readFileSync('test/acronym.out', 'utf8')
        const json = fs.readJsonSync(`${process.cwd()}/test/acronym.json`)
        const obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
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
      child.exec(`node ${process.cwd()}/build/leximaven.js anagram -o ${process.cwd()}/test/anagram.json ubiquity > test/anagram.out`, (err) => {
        const stdout = fs.readFileSync('test/anagram.out', 'utf8')
        const json = fs.readJsonSync(`${process.cwd()}/test/anagram.json`)
        const obj = {
          type: 'anagram',
          source: 'http://wordsmith.org/',
          found: '2',
          show: 'all',
          alist: [
            'Ubiquity',
            'Buy I Quit',
          ],
        }
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[Anagrams\]\sAnagrams for: [a-z]*\s\d* found. Displaying all:\s[a-z\s]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('comp', () => {
    it('outputs shell completion script', (done) => {
      child.exec(`node ${__dirname}/../build/leximaven.js comp > test/comp.out`, (err) => {
        const stdout = fs.readFileSync('test/comp.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[#\-a-z0-9\.\s:\/>~_\(\)\{\}\[\]="$@,;]*/mig)
        done(err)
      })
    })
  })
  describe('dmuse', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js dmuse -o ${process.cwd()}/test/dmuse.json ml=ubiquity > test/dmuse.out`, (err) => {
        const stdout = fs.readFileSync('test/dmuse.out', 'utf8')
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
        const json = fs.readJsonSync(`${process.cwd()}/test/dmuse.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→\s,]*\/dmuse.json./mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('help', () => {
    it('shows usage', (done) => {
      child.exec(`node ${__dirname}/../build/leximaven.js --help > test/help.out`, (err) => {
        const stdout = fs.readFileSync('test/help.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[_ \/\(\)\-\\'`|,\s]*\s*Usage:\s[a-z \/\.<>\[\]]*\s*Commands:\s[ a-z<>\s]*:\s[ \-a-z,\[\]\s]*\[boolean\]\s*/mig)
        done(err)
      })
    })
  })
  describe('ls', () => {
    it('demonstrates installed themes', (done) => {
      child.exec(`node ${__dirname}/../build/leximaven.js ls > test/ls.out`, (err) => {
        const stdout = fs.readFileSync('test/ls.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z :|,.<>\-\[\]→]*/mig)
        done(err)
      })
    })
  })
  describe('map', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js map ubiquity > test/map.out`, (err) => {
        const stdout = fs.readFileSync('test/map.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\],→ ;:'\?"\(\)-\.√©ĭēˈɪ”]*/mig)
        done(err)
      })
    })
  })
  describe('onelook', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js onelook -o ${process.cwd()}/test/onelook.json ubiquity > test/onelook.out`, (err) => {
        const stdout = fs.readFileSync('test/onelook.out', 'utf8')
        const obj = {
          type: 'onelook',
          source: 'http://www.onelook.com',
          definition: 'noun: the state of being everywhere at once (or seeming to be everywhere at once)',
          phrase: 'ubiquity records',
          sim: 'omnipresence,ubiquitousness',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/onelook.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]:\(\)→ \/\.,]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('urban', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js urban -o ${process.cwd()}/test/urban.json ubiquity > test/urban.out`, (err) => {
        const stdout = fs.readFileSync('test/urban.out', 'utf8')
        const obj = {
          type: 'urban',
          source: 'http://www.urbandictionary.com',
          definition0: 'Omnipresent; An existence or perceived existence of being everywhere at once.',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/urban.json`)
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

describe('config command', () => {
  before((done) => {
    // fs.mkdirpSync('test/output')
    fs.copySync(CFILE, 'test/.leximaven.noon')
    done()
  })
  after((done) => {
    fs.copySync('test/.leximaven.noon', CFILE)
    // fs.removeSync('test/output')
    done()
  })
  describe('get', () => {
    it('shows value of option verbose', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config get verbose > test/config-get.out`, (err) => {
        const stdout = fs.readFileSync('test/config-get.out', 'utf8')
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
      child.exec(`node ${process.cwd()}/build/leximaven.js config init > test/config-init.out`, (err) => {
        const stdout = fs.readFileSync('test/config-init.out', 'utf8')
        const config = noon.load(CFILE)
        const obj = {
          anagram: {
            case: 1,
            lang: 'english',
            linenum: false,
            list: false,
            limit: 10,
            minletter: 1,
            maxletter: 50,
            maxword: 10,
            repeat: false,
          },
          combine: {
            lang: 'en',
            max: 5,
          },
          define: {
            canon: false,
            defdict: 'all',
            limit: 5,
            part: '',
          },
          dmuse: {
            max: 5,
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
          info: {
            lang: 'en',
          },
          onelook: {
            links: false,
          },
          origin: {
            canon: false,
          },
          phrase: {
            canon: false,
            limit: 5,
            weight: 13,
          },
          merge: true,
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
          rhyme: {
            lang: 'en',
            max: 50,
          },
          theme: 'square',
          urban: {
            limit: 5,
          },
          verbose: false,
          wordmap: {
            limit: 1,
          },
        }
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Created [\/a-z\.\s]*:\s[ a-z0-9\W]*/mig)
        expect(JSON.stringify(config, null, ' ')).to.equals(JSON.stringify(obj, null, ' '))
        done(err)
      })
    })
  })
  describe('set', () => {
    it('sets value of option verbose to true', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js config set verbose false > test/config-set.out`, (err) => {
        const stdout = fs.readFileSync('test/config-set.out', 'utf8')
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Set option verbose to (true|false)\./mig)
        done(err)
      })
    })
  })
})

describe('rbrain command', () => {
  // before((done) => {
  //   fs.mkdirpSync('test/output')
  //   done()
  // })
  // after((done) => {
  //   fs.removeSync('test/output')
  //   done()
  // })
  describe('combine', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain combine -o ${process.cwd()}/test/combine.json value > test/combine.out`, (err) => {
        const stdout = fs.readFileSync('test/combine.out', 'utf8')
        const obj = {
          type: 'portmanteau',
          source: 'http://rhymebrain.com',
          set0: 'value,united',
          portmanteau0: 'valunited',
          set1: 'value,unique',
          portmanteau1: 'valunique',
          set2: 'value,utility',
          portmanteau2: 'valutility',
          set3: 'value,uniqueness',
          portmanteau3: 'valuniqueness',
          set4: 'value,utilitarian',
          portmanteau4: 'valutilitarian',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/combine.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z,→ \/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('info', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain info -o ${process.cwd()}/test/info.json ubiquity > test/info.out`, (err) => {
        const stdout = fs.readFileSync('test/info.out', 'utf8')
        const obj = {
          type: 'word info',
          source: 'http://rhymebrain.com',
          arpabet: 'Y UW0 B IH1 K W IH0 T IY0',
          ipa: 'juˈbɪkwɪti',
          syllables: '4',
          dict: true,
          trusted: true,
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/info.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9 →ˈɪ\/\.,]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('rhyme', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js rbrain rhyme -m5 -o ${process.cwd()}/test/rhyme.json ubiquity > test/rhyme.out`, (err) => {
        const stdout = fs.readFileSync('test/rhyme.out', 'utf8')
        const obj = {
          type: 'rhyme',
          source: 'http://rhymebrain.com',
          rhyme0: 'stability',
          rhyme1: 'typically',
          rhyme2: 'specifically',
          rhyme3: 'respectively',
          rhyme4: 'effectively',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/rhyme.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Rhymes\]→[a-z*,]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.match(/[\{\}a-z0-9\s:\/\.",]*/mig)
        done(err)
      })
    })
  })
})

describe('wordnik command', () => {
  // before((done) => {
  //   fs.mkdirpSync('test/output')
  //   done()
  // })
  // after((done) => {
  //   fs.removeSync('test/output')
  //   done()
  // })
  describe('define', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik define -l1 -o ${process.cwd()}/test/define.json ubiquity > test/define.out`, (err) => {
        const stdout = fs.readFileSync('test/define.out', 'utf8')
        const obj = {
          type: 'definition',
          source: 'http://www.wordnik.com',
          text0: 'Existence or apparent existence everywhere at the same time; omnipresence: "the repetitiveness, the selfsameness, and the ubiquity of modern mass culture”  ( Theodor Adorno ). ',
          deftype0: 'noun',
          source0: 'ahd-legacy',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/define.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→ ;:",\-\(\)\.\/”]*Wrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('example', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik example -l1 -o ${process.cwd()}/test/example.json ubiquity > test/example.out`, (err) => {
        const stdout = fs.readFileSync('test/example.out', 'utf8')
        const obj = {
          type: 'example',
          source: 'http://www.wordnik.com',
          example0: 'Both are characterized by their ubiquity and their antiquity: No known human culture lacks them, and musical instruments are among the oldest human artifacts, dating to the Late Pleistocene about 50,000 years ago.',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/example.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\] →:,\.]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('hyphen', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik hyphen -o ${process.cwd()}/test/hyphen.json ubiquity > test/hyphen.out`, (err) => {
        const stdout = fs.readFileSync('test/hyphen.out', 'utf8')
        const obj = {
          type: 'hyphenation',
          source: 'http://www.wordnik.com',
          syllable0: 'u',
          stress1: 'biq',
          syllable2: 'ui',
          syllable3: 'ty',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/hyphen.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Hyphenation\]u-biq-ui-ty\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('origin', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik origin -o ${process.cwd()}/test/origin.json ubiquity > test/origin.out`, (err) => {
        const stdout = fs.readFileSync('test/origin.out', 'utf8')
        const obj = {
          type: 'etymology',
          source: 'http://www.wordnik.com',
          etymology: '[L.  everywhere, fr.  where, perhaps for ,  (cf.  anywhere), and if so akin to E. : cf. F. .]',
          origin: 'ubique, ubi, cubi, quobi, alicubi, who, ubiquit√©',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/origin.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\]→\.,\(\):√©]*Wrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('phrase', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik phrase -o ${process.cwd()}/test/phrase.json ubiquitous > test/phrase.out`, (err) => {
        const stdout = fs.readFileSync('test/phrase.out', 'utf8')
        const obj = {
          type: 'phrase',
          source: 'http://www.wordnik.com',
          agram0: 'ubiquitous',
          bgram0: 'amoeba',
          agram1: 'ubiquitous',
          bgram1: 'fakes',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/phrase.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]\-\s]*Wrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('pronounce', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik pronounce -o ${process.cwd()}/test/pronounce.json ubiquity > test/pronounce.out`, (err) => {
        const stdout = fs.readFileSync('test/pronounce.out', 'utf8')
        const obj = {
          type: 'pronunciation',
          source: 'http://www.wordnik.com',
          word: 'ubiquity',
          pronunciation0: '(yo͞o-bĭkˈwĭ-tē)',
          type0: 'ahd-legacy',
          pronunciation1: 'Y UW0 B IH1 K W IH0 T IY0',
          type1: 'arpabet',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/pronounce.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]\(\) \-→ĭēˈ\so͞]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
  describe('relate', () => {
    it('shows output', (done) => {
      child.exec(`node ${process.cwd()}/build/leximaven.js wordnik relate -o ${process.cwd()}/test/relate.json ubiquity > test/relate.out`, (err) => {
        const stdout = fs.readFileSync('test/relate.out', 'utf8')
        const obj = {
          type: 'related words',
          source: 'http://www.wordnik.com',
          word: 'ubiquity',
          type0: 'antonym',
          words0: 'uniquity',
          type1: 'hypernym',
          words1: 'presence',
          type2: 'cross-reference',
          words2: 'ubiquity of the king, coefficient',
          type3: 'synonym',
          words3: 'omnipresence',
          type4: 'rhyme',
          words4: 'iniquity',
          type5: 'same-context',
          words5: 'omnipresence, omniscience, self-existence, omnipotence, arahantship, timelessness, Catholicism, invincibility, nondiscrimination, barracoon',
        }
        const json = fs.readJsonSync(`${process.cwd()}/test/relate.json`)
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\],\-→]*\sWrote data to [a-z\/\.]*/mig)
        expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
        done(err)
      })
    })
  })
})
