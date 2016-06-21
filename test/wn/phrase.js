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
const outfile = path.resolve('test/output/phrase.out')

describe('command: wordnik phrase', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using wordnik phrase', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js wordnik phrase -o ${process.cwd()}/test/output/phrase.json ubiquitous > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'phrase',
        agram0: 'ubiquitous',
        bgram0: 'amoeba',
        agram1: 'ubiquitous',
        bgram1: 'fakes',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/phrase.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[[\w\W]*\]\s[\w\W]*Wrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
