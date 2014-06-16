
// get the entry point
// to do: make robust with remotes

var path = require('path')
var chalk = require('chalk')
var log = require('normalize-log')

module.exports = function (manifest, program) {
  var args = program.args
  if (args.length > 1) {
    log.error('you may only specify one entry point!')
    process.exit(1)
  }

  var entrypoint = args[0]
  if (!entrypoint) {
    log.error('no entry point provided!')
    process.exit(1)
  }

  var file = manifest[entrypoint]
  if (!file) {
    entrypoint = path.resolve(entrypoint)
    entrypoint = './' + path.relative(process.cwd(), entrypoint)
    file = manifest[entrypoint]
  }
  if (!file) {
    console.error('entry point ' + chalk.red(entrypoint) + ' was not found in the manifest.')
    process.exit(1)
  }
  
  return file
}
