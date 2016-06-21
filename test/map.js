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
const outfile = path.resolve('test/output/map.out')

describe('command: map', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using map', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js map ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Wordmap\]\s[0-9a-z\[\]\s\W]*Buy I Quit/mig)
      done(err)
    })
  })
})
