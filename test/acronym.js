/* eslint max-len: 0 */
const Code = require('code')
const Lab = require('lab')
const child = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
const expect = Code.expect
const outfile = path.resolve('test/output/acronym.out')

describe('command: acronym', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using acronym', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js acronym -o ${process.cwd()}/test/output/acronym.json DDC > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const json = fs.readJsonSync(`${process.cwd()}/test/output/acronym.json`)
      const obj = {
        type: 'acronym',
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
