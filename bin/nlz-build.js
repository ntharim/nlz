
var program = require('commander')

program._name = 'nlz build'
program
  .usage('[options] [entrypoints...] [-]')
  .option('-w, --watch', 'watch for file changes and rebuild automatically')
  .option('-o, --out <dir>', 'output directory for all builds')
  .option('-s, --standalone <name>', 'build as a standalone UMD module')

program.on('--help', function () {
  console.log('  To print to stdout, set `-` as an argument.')
  console.log('  When printing to stdout, you may only specify 1 entry point.')
  console.log()
  console.log('    # log the build to the console')
  console.log('    nlz build index.js -')
  console.log()
  console.log('    # save the build to a file of your choice')
  console.log('    nlz build index.js - > dist/index.js')
  console.log()
})

require('../lib/build')
