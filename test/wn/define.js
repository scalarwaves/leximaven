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
const outfile = path.resolve('test/output/define.out')

describe('command: wordnik define', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using wordnik define', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js wordnik define -l1 -o ${process.cwd()}/test/output/define.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'definition',
        text0: 'Existence or apparent existence everywhere at the same time; omnipresence: \"the repetitiveness, the selfsameness, and the ubiquity of modern mass culture”  ( Theodor Adorno ). ',
        deftype0: 'noun',
        source0: 'ahd-legacy',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/define.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[\w*\][\w\W]*Wrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
