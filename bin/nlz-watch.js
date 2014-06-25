
var program = require('commander')

program._name = 'nlz watch'
program
  .usage('[options] [entrypoints...]')
  .option('-o, --out <dir>', 'output directory for all builds')
  .option('-s, --standalone <name>', 'build as a standalone UMD module')

program.on('--help', function () {
  console.log('  This command is the same as `nlz build --watch`')
  console.log('  except stdout is not supported.')
  console.log()
})

program.watch = true

require('../lib/build')
