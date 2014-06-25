
/**
 * To do: dedupe with nlz-build
 */

var program = require('commander')

program._name = 'nlz manifest'
program
  .usage('[options] [entrypoints...]')
  .option('-M, --no-min', 'do not calculate minified file sizes')

program.parse(process.argv)

var Options = require('normalize-rc')
var co = require('co')

var options = Options()
options.minifiedLength = program.min
var builder = require('../lib/builder')(program, options)

co(function* () {
  yield* builder.build()
  yield builder.await('manifest')
  options.agent.close()
})()
