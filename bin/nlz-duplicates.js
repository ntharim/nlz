
var program = require('commander')

program._name = 'nlz duplicates'
program
  .usage('[options] <entrypoint>')

program.on('--help', function () {
  console.log('  List all duplicate dependencies.')
  console.log('  Example:')
  console.log()
  console.log('    # list the duplicate dependencies of index.js')
  console.log('    nlz duplicates index.js')
  console.log()
  console.log('  "Redundancy" is the byte size you can save by only using')
  console.log('  the latest version of a dependency.')
  console.log()
  process.exit()
})

program.parse(process.argv)

var log = require('normalize-log')

var entrypoint = program.args[0]
if (!entrypoint) {
  log.error('no entry point provided!')
  process.exit(1)
}

var bytes = require('bytes')
var chalk = require('chalk')
var semver = require('semver')
var options = require('normalize-rc')()
var manifest = require('./_manifest')(options)

// all the files
var files = Object.keys(manifest).map(function (name) {
  return manifest[name]
})

// list all the remote dependencies
var dependencies = {}
files.forEach(function (file) {
  if (file.type !== 'remote') return
  var name = file.remote + ':' + file.user + '/' + file.project
  var dep = dependencies[name]
    || (dependencies[name] = {
      remote: file.remote,
      user: file.user,
      project: file.project,
      versions: {},
    })

  var version = dep.versions[file.version]
    || (dep.versions[file.version] = [])
  version.push(file)
})

// delete all the remote dependencies without multiple versions
Object.keys(dependencies).forEach(function (name) {
  var versions = dependencies[name].versions
  if (Object.keys(versions).length < 2) delete dependencies[name]
})

// list them all!
console.log()
Object.keys(dependencies).map(function (name) {
  var dep = dependencies[name]
  var title = chalk.grey(dep.remote === 'npm' || dep.remote === 'github'
      ? ''
      : (dep.remote + ':'))
    + chalk.grey(dep.user && dep.user !== '-'
      ? (dep.user + '/')
      : '')
    + chalk.grey(dep.project)
  var versions = Object.keys(dep.versions)

  // get the largest version
  var latest = versions.filter(function (version) {
    return semver.valid(version)
  }).sort(semver.rcompare)[0]

  // calculate the total size saved if removing everything
  // but the latest version
  var diff = 0
  versions.filter(function (version) {
    return version !== latest
  }).forEach(function (version) {
    dep.versions[version].forEach(function (file) {
      diff += file.minifiedLength || file.length
    })
  })

  console.log('  ' + title + ' '
     + chalk.yellow('redundancy')
     + ': '
     + chalk.red(bytes(diff)))

  var versions = Object.keys(dep.versions)
  versions.forEach(function (version, index) {
    var last = versions.length === index + 1
    var symbol = last ? '└' : '├'
    console.log('   ' + symbol + ' ' + version)

    var files = dep.versions[version]
    files.forEach(function (file, index) {
      var begin = last ? ' ' : '│'
      var symbol = files.length === index + 1
        ? '└'
        : '├'
      console.log('   ' + begin + '  ' + symbol + ' ' + file.name + ' - ' + file.size)

      var dependents = file.dependents
      dependents.forEach(function (dependent, index) {
        var symbol = dependents.length === index + 1
          ? '└'
          : '├'
        console.log('   ' + begin + '     ' + symbol + ' ' + dependent.name)
      })
    })
  })
})
console.log()
