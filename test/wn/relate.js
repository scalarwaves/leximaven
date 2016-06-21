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
const outfile = path.resolve('test/output/relate.out')

describe('command: wordnik relate', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  after((done) => {
    fs.removeSync('test/output')
    done()
  })
  it('shows output using wordnik relate', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js wordnik relate -o ${process.cwd()}/test/output/relate.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const obj = {
        type: 'related words',
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
      const json = fs.readJsonSync(`${process.cwd()}/test/output/relate.json`)
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[\w*\]\s\[\w* \w*\]\s[\w\W]*Wrote data to [\w\/\.]*\./mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
