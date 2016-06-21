/* eslint max-len: 0 */
const Code = require('code')
const Lab = require('lab')
const child = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const CFILE = `${process.env.HOME}/.leximaven.noon`
const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after
const expect = Code.expect
const outfile = path.resolve('test/output/config-get.out')

describe('command: config get', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    fs.copySync(CFILE, 'test/output/.leximaven.noon')
    done()
  })
  after((done) => {
    fs.copySync('test/output/.leximaven.noon', CFILE)
    fs.removeSync('test/output')
    done()
  })
  it('shows value of option verbose', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js config get verbose > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Option verbose is (true|false)\./mig)
      done(err)
    })
  })
})
