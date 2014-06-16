
var program = require('commander')

program._name = 'nlz size'
program
  .usage('[options] <entrypoint>')
  .option('-e, --exts <names>', 'filter by a comma-separated list of extensions')
  .option('-t, --threshold <size>', 'minimum file size to list')

program.parse(process.argv)

var path = require('path')
var bytes = require('bytes')
var chalk = require('chalk')
var Table = require('cli-table')
var options = require('normalize-rc')()
var humanize = require('humanize-number')
var manifest = require('../lib/manifest')(options)
var file = require('../lib/entrypoint')(manifest, program)

// list all of the file's dependencies
var files = []
walk(file)
var count = files.length - 1

function walk(file) {
  if (~files.indexOf(file)) return
  files.push(file)

  var deps = file.dependencies
  Object.keys(deps).forEach(function (name) {
    walk(manifest[deps[name]])
  })
}

var exts = program.exts
if (exts) {
  exts = exts.split(/\s*,\s*/)
  files = files.filter(function (file) {
    return ~exts.indexOf(path.extname(file.filename || file.uri).slice(1))
  })
}

var total = files.map(function (file) {
  return file.bytes
}).reduce(function (a, b) {
  return a + b
}, 0)

var min = program.threshold
if (min) {
  min = bytes(min)
  files = files.filter(function (file) {
    return file.bytes > min
  })
}

files = files.sort(function (a, b) {
  return b.bytes - a.bytes
})

var table = new Table({
  head: ['File', 'Size'],
})

files.forEach(function (file) {
  table.push([
    file.name,
    file.size,
  ])
})

console.log()
console.log('   Entry Point: ' + file.name)
console.log('    Total Size: ' + chalk.red(bytes(total)))
console.log('  Dependencies: ' + chalk.grey(humanize(count)))
console.log('     Threshold: ' + chalk.grey('>= ' + bytes(min || 0)))
console.log('    Extensions: ' + chalk.grey(exts ? exts.join(', ') : '*'))

console.log()
console.log(table.toString().replace(/^/gm, '  '))
console.log()
