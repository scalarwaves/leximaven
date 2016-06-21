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
const outfile = path.resolve('test/output/rhyme.out')

describe('command: rbrain rhyme', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using rbrain rhyme', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js rbrain rhyme -m5 -o ${process.cwd()}/test/output/rhyme.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'rhyme',
        rhyme0: 'stability',
        rhyme1: 'typically',
        rhyme2: 'specifically',
        rhyme3: 'respectively',
        rhyme4: 'effectively',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/rhyme.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[\w*\]\s[a-z,]*\sWrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
