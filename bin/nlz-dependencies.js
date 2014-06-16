
var program = require('commander')

program._name = 'nlz dependencies'
program
  .usage('[options] <entrypoint>')
  .option('-r, --remotes', 'include dependencies of remotes')

program.on('--help', function () {
  console.log('  List all the dependencies of the entry point.')
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

var entrypoint = program.args[0]
if (!entrypoint) {
  log.error('no entry point provided!')
  process.exit(1)
}

var path = require('path')
var chalk = require('chalk')
var options = require('normalize-rc')()
var manifest = require('./_manifest')(options)

var logged = []
var queue = []

// resolve the entry point
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

  var deps = file.dependencies
  var names = Object.keys(deps)
  if (!names.length) return

  console.log('  ' + file.name + ' - ' + file.size)
  names.forEach(function (name, i) {
    var dep = manifest[deps[name]]
    if (!~logged.indexOf(dep) && !~queue.indexOf(dep)) queue.push(dep)
    var anchor = i === names.length - 1
      ? '└─'
      : '├─'
    console.log('   ' + anchor + ' ' + dep.name + ' - ' + dep.size)
  })
}
