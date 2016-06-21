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
const outfile = path.resolve('test/output/pronounce.out')

describe('command: wordnik pronounce', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using wordnik pronounce', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js wordnik pronounce -o ${process.cwd()}/test/output/pronounce.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'pronunciation',
        word: 'ubiquity',
        pronunciation0: '(yo͞o-bĭkˈwĭ-tē)',
        type0: 'ahd-legacy',
        pronunciation1: 'Y UW0 B IH1 K W IH0 T IY0',
        type1: 'arpabet',
      }
      const json = fs.readJsonSync(`${process.cwd()}/test/output/pronounce.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[[\w\W]*\]\s[\w\W]*Wrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
