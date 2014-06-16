
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
