
/**
 * To do: dedupe with nlz-build
 */

var program = require('commander')

program._name = 'nlz manifest'
program
  .usage('[options] [entrypoints...]')

program.parse(process.argv)

var Options = require('normalize-rc')
var co = require('co')

var options = Options()
var builder = require('./_build')(program, options)

co(function* () {
  yield* builder.build()
  yield builder.await('manifest')
  options.agent.close()
})()
