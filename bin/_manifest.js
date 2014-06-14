
// get the manifest and format it

var log = require('normalize-log')
var bytes = require('bytes')
var chalk = require('chalk')
var fs = require('fs')

module.exports = function (options) {
  var filename = options.manifest

  if (!fs.existsSync(filename)) {
    log.error('no ' + chalk.grey('normalize-manifest.json') + ' found.')
    log.error('please run ' + chalk.red('nlz build') + ' first.')
    process.exit(1)
  }

  var manifest = require(filename)
  Object.keys(manifest).forEach(function (uri) {
    var file = manifest[uri]
    file.name = stringify(file)
    file.size = lengthOf(file)
  })

  return manifest
}

function stringify(file) {
  if (file.remote) {
    return chalk.grey(file.remote === 'npm' || file.remote === 'github'
        ? ''
        : (file.remote + ':'))
      + chalk.grey(file.user && file.user !== '-'
        ? (file.user + '/')
        : '')
      + chalk.grey(file.project)
      + chalk.green('@' + file.version)
      + chalk.cyan('/' + file.filename)
  } else {
    return chalk.cyan(file.uri)
  }
}

function lengthOf(file) {
  file.bytes = file.minifiedLength || file.length
  return chalk.yellow(bytes(file.bytes))
}
