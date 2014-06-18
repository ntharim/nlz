
// get the entry point
// to do: make robust with remotes

var path = require('path')
var chalk = require('chalk')
var log = require('normalize-log')

module.exports = function (manifest, program) {
  var args = program.args
  if (args.length > 1) {
    console.error()
    log.error('you may only specify one entry point!')
    console.error()
    process.exit(1)
  }

  var entrypoint = args[0]
  if (!entrypoint) {
    console.error()
    log.error('no entry point provided!')
    console.error()
    process.exit(1)
  }

  var file = manifest[entrypoint]
  if (!file) {
    entrypoint = path.resolve(entrypoint)
    entrypoint = './' + path.relative(process.cwd(), entrypoint)
    file = manifest[entrypoint]
  }
  if (!file) {
    console.error()
    log.error('entry point ' + chalk.red(entrypoint) + ' was not found in the manifest.')
    console.error()
    process.exit(1)
  }

  return file
}
