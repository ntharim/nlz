
var program = require('commander')

program._name = 'nlz dependencies'
program
  .usage('[options] <entrypoint>')
  .option('-d, --depth <depth>', 'maximum nested tree depth', 5)
  .option('-r, --remotes', 'include dependencies of remotes')
  .option('-c, --coalesce', 'coalesce remote files to the project')

program.on('--help', function () {
  console.log('  List all the dependencies of the entry point as a tree.')
  console.log('  Example:')
  console.log()
  console.log('    # show the dependencies of index.js')
  console.log('    nlz tree index.js')
  console.log()
  process.exit()
})

program.parse(process.argv)
