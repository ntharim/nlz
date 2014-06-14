
var program = require('commander')

program._name = 'nlz dependencies'
program
  .usage('[options] [entrypoint]')
  .option('-r, --remotes', 'include dependencies of remotes')

program.on('--help', function () {
  console.log('  List all the dependencies of the entry point as a flat list.')
  console.log('  Example:')
  console.log()
  console.log('    # list the dependencies of index.js')
  console.log('    nlz dependencies index.js')
  console.log()
  console.log('  Unlike other commands, `nlz-dependencies(1)` does not infer')
  console.log('  the entry points from `.nlzrc`. Even if it did, the list')
  console.log('  would probably be too large for anyone to comprehend.')
  console.log('  Inspect dependencies one file at a time!')
  console.log()
  process.exit()
})

program.parse(process.argv)

var log = require('normalize-log')
var chalk = require('chalk')

var entrypoint = program.args[0]
if (!entrypoint) {
  log.error('no entry point provided!')
  process.exit(1)
}

var bytes = require('bytes')
var path = require('path')
var fs = require('fs')

var filename = require('normalize-rc')().manifest
if (!fs.existsSync(filename)) {
  log.error('no ' + chalk.grey('normalize-manifest.json') + ' found.')
  log.error('please run ' + chalk.red('nlz build') + ' first.')
  process.exit(1)
}

var manifest = require(filename)
var logged = []
var queue = []

// resolve the entry point as a canonical
entrypoint = path.resolve(entrypoint)
entrypoint = './' + path.relative(process.cwd(), entrypoint)
var file = manifest[entrypoint]
if (!file) {
  console.error('entry point ' + chalk.red(entrypoint) + ' was not found in the manifest.')
  process.exit(1)
}

console.log()
logFile(file)
while (queue.length) logFile(queue.shift())
console.log()

// top level log
function logFile(file) {
  // remove from queue
  var index = queue.indexOf(file)
  if (!index) queue.splice(index, 1)

  // already logged
  if (~logged.indexOf(file)) return
  logged.push(file)

  // don't log remote files
  if (file.remote && !program.remotes) return

  console.log('  ' + stringify(file))

  var deps = file.dependencies
  var names = Object.keys(deps)
  names.forEach(function (name, i) {
    var dep = manifest[deps[name]]
    if (!~logged.indexOf(dep) && !~queue.indexOf(dep)) queue.push(dep)
    var anchor = i === names.length - 1
      ? '└─'
      : '├─'
    console.log('   ' + anchor + ' ' + stringify(dep))
  })
}

function stringify(file) {
  if (file.remote) {
    return chalk.grey(file.remote === 'npm' || file.remote === 'github'
        ? ''
        : (file.remote + ':'))
      + chalk.grey(file.user && file.user !== '-'
        ? (file.user + '/')
        : '')
      + chalk.grey(file.project)
      + chalk.green('@' + file.version)
      + chalk.cyan('/' + file.filename)
      + lengthOf(file)
  } else {
    return chalk.cyan(file.uri) + lengthOf(file)
  }
}

function lengthOf(file) {
  return ' - ' + chalk.yellow(bytes(file.minifiedLength || file.length))
}
