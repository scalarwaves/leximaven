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
const outfile = path.resolve('test/output/dmuse.out')

describe('command: dmuse', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using dmuse', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js dmuse -o ${process.cwd()}/test/output/dmuse.json ml=ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'datamuse',
        match0: 'ubiquitousness',
        tags1: 'noun',
        match1: 'omnipresence',
        match2: 'pervasiveness',
        tags0: 'noun',
        match3: 'popularization',
        match4: 'popularity',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/dmuse.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Datamuse\]\s[\[\]a-z\s-,]*noun/mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
