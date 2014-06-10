
var program = require('commander')

program._name = 'nlz duplicates'
program
  .usage('[options] [entrypoint]')

program.on('--help', function () {
  console.log('  List all duplicate dependencies.')
  console.log('  Example:')
  console.log()
  console.log('    # list the duplicate dependencies of index.js')
  console.log('    nlz duplicates index.js')
  console.log()
  process.exit()
})

program.parse(process.argv)
