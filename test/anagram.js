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
const outfile = path.resolve('test/output/anagram.out')

describe('command: anagram', () => {
  before((done) => {
    fs.mkdirpSync('test/output')
    done()
  })
  // after((done) => {
  //   fs.removeSync('test/output')
  //   done()
  // })
  it('shows output using anagram', (done) => {
    child.exec(`node ${process.cwd()}/build/leximaven.js anagram -o ${process.cwd()}/test/output/anagram.json ubiquity > ${outfile}`, (err) => {
      const stdout = fs.readFileSync(outfile, 'utf8')
      const json = fs.readJsonSync(`${process.cwd()}/test/output/anagram.json`)
      const obj = {
        type: 'anagram',
        found: '2',
        show: 'all',
        alist: [
          'Ubiquity',
          'Buy I Quit',
        ],
      }
      expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Wrote data to [a-z\/]*.json.\sdone.\s\[Anagrams\]\sAnagrams for: [a-z]*\s\d* found. Displaying all:\s[a-z\s]*/mig)
      expect(JSON.stringify(json)).to.equals(JSON.stringify(obj))
      done(err)
    })
  })
})
