
var program = require('commander')

program._name = 'nlz graph'
program
  .usage('[options]')
  .option('-b, --browser <name>', 'open the graph in a specific browser')

program.parse(process.argv)

var options = require('normalize-rc')()
var manifest = require(options.manifest)
require('normalize-graph')(manifest, program.browser)
