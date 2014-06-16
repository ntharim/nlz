
var program = require('commander')

program._name = 'nlz build'
program
  .usage('[options] [entrypoints...]')
  .option('-w, --watch', 'watch for file changes and rebuild automatically')
  .option('-o, --out <dir>', 'output directory')

program.parse(process.argv)

var Options = require('normalize-rc')
var log = require('normalize-log')
var bytes = require('bytes')
var chalk = require('chalk')
var path = require('path')
var fs = require('fs')
var co = require('co')

// parse options
var options = Options()

// output folder
var out = path.resolve(program.out || options.out)
require('mkdirp').sync(out)

// builder instance
var builder = require('../lib/build')(program, options)
var entrypoints = options.entrypoints

// setup the entrypoints
Object.keys(entrypoints).forEach(function (entrypoint) {
  var name = path.basename(entrypoint)
  builder.on(entrypoint, function (string) {
    fs.writeFile(path.resolve(out, name), string, function (err) {
      if (err) throw err
      log.info(chalk.grey('built'), chalk.blue(name) + ' ' + chalk.yellow(byteSize(string)))
    })
  })
})

if (options.watch) {
  // automatically minify the file sizes in the manifest
  options.minifiedLength = true
  builder.watch()
  co(builder.build())()
} else {
  co(function* () {
    yield* builder.build()
    yield builder.await('manifest')
    options.agent.close()
  })()
}

function byteSize(string) {
  return bytes(Buffer.byteLength(string))
}
