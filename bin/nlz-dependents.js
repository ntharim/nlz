
var program = require('commander')

program._name = 'nlz dependents'
program
  .usage('[options] <entrypoint>')

program.on('--help', function () {
  console.log('  List all the dependents of the entry point.')
  console.log('  Example:')
  console.log()
  console.log('    # list the dependents of index.js')
  console.log('    nlz dependents index.js')
  console.log()
  console.log('    # list all dependents of component/emitter@1')
  console.log('    nlz dependents component/emitter@1')
  console.log()
  process.exit()
})

program.parse(process.argv)

var options = require('normalize-rc')()
var manifest = require('../lib/manifest')(options)
var file = require('../lib/entrypoint')(manifest, program)

var logged = []
var queue = []

console.log()
logFile(file)
while (queue.length) logFile(queue.shift())
console.log()

// top level log
function logFile(file) {
  // remove from queue
  var index = queue.indexOf(file)
  if (~index) queue.splice(index, 1)

  // already logged
  if (~logged.indexOf(file)) return
  logged.push(file)

  var dependents = file.dependents
  if (!dependents.length) return

  console.log('  ' + file.name + ' - ' + file.size)
  dependents.forEach(function (dep, i) {
    if (!~logged.indexOf(dep) && !~queue.indexOf(dep)) queue.push(dep)
    var anchor = i === dependents.length - 1
      ? '└─'
      : '├─'
    console.log('   ' + anchor + ' ' + dep.name + ' - ' + dep.size)
  })
}
