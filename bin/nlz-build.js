
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

// check for stdout
var stdindex = program.args.indexOf('-')
if (~stdindex) {
  program.args.splice(stdindex, 1)
  options.stdout = true
  if (program.watch) {
    console.error()
    log.error('you can not use `--watch` when printing to stdout')
    console.error()
    process.exit(1)
  }
}

// builder instance
var builder = require('../lib/build')(program, options)
var entrypoints = options.entrypoints

if (options.standalone) {
  Object.keys(entrypoints).filter(function (entrypoint) {
    return /\.js$/.exec(entrypoint)
  }).forEach(function (entrypoint, i) {
    if (i > 0) {
      console.error()
      log.error('you may not specify more than one .js entry point when using `--standalone`.')
      console.error()
      process.exit(1)
    }

    builder.options[entrypoint].umd = program.standalone
  })
}

if (options.stdout) {
  // stdout
  Object.keys(entrypoints).forEach(function (entrypoint, i) {
    if (i > 0) {
      console.error()
      log.error('you may not specify more than one entry point when using stdout.')
      console.error()
      process.exit(1)
    }

    builder.on(entrypoint, function (string) {
      process.stdout.write(string)
    })
  })
} else {
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
}

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
