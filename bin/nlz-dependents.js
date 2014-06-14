
var program = require('commander')

program._name = 'nlz dependents'
program
  .usage('[options] <entrypoint>')
  .option('-r, --remotes', 'include dependencies of remotes')
  .option('-c, --coalesce', 'coalesce remote files to the project')

program.on('--help', function () {
  console.log('  List all the dependents of the entry point as a flat list.')
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
