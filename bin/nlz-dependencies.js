
var program = require('commander')

program._name = 'nlz dependencies'
program
  .usage('[options] [entrypoint]')
  .option('-r, --remotes', 'include dependencies of remotes')
  .option('-c, --coalesce', 'coalesce remote files to the project')

program.on('--help', function () {
  console.log('  List all the dependencies of the entry point as a flat list.')
  console.log('  Example:')
  console.log()
  console.log('    # list the dependencies of index.js')
  console.log('    nlz dependencies index.js')
  console.log()
  process.exit()
})

program.parse(process.argv)

var entrypoint = process.argv[2]
if (!entrypoint) {
  console.error('error: no entry point provided.')
  process.exit(1)
}

var bytes = require('bytes')
var fs = require('fs')

var filename = require('../lib/options')().manifest
if (!fs.existsSync(filename)) {
  console.error('error: no normalize-manifest.json found.')
  console.error('error: please run `nlz build` first.')
  process.exit(1)
}

var manifest = require(filename)
var files = Object.keys(manifest).map(function (name) {
  return manifest[name]
}).reverse()
files.forEach(function (file) {
  if (file.type !== 'remote') return
  file.shorthand = file.remote
    + ':' + file.user
    + '/' + file.project
    + '@' + file.version
    + '/' + file.filename
})

console.log()
files.forEach(function (file) {
  console.log('  ' + stringify(file))
  var deps = file.dependencies
  Object.keys(deps).forEach(function (name) {
    var dep = manifest[deps[name]]
    if (file.remote && dep.remote && !program.remotes) return
    console.log('    - ' + stringify(dep))
  })
})
console.log()

function stringify(file) {
  return (file.shorthand || file.uri)
    + ' - ' + bytes(file.minifiedLength || file.length)
}
