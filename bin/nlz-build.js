
var program = require('commander')

program._name = 'nlz build'
program
  .usage('[options] [entrypoints...]')
  .option('-w, --watch', 'watch for file changes and rebuild automatically')
  .option('-o, --out <dir>', 'output directory')

program.parse(process.argv)

var Build = require('normalize-build')
var Options = require('normalize-rc')
var log = require('normalize-log')
var bytes = require('bytes')
var path = require('path')
var fs = require('fs')
var co = require('co')

// parse options
var options = Options()
// overwrite .rc file's entrypoints
if (program.args.length) options.entrypoints = Options.entrypoints(program.args)

// output folder
var out = path.resolve(program.out || options.out)
require('mkdirp').sync(out)

// need entry points, duh
var entrypoints = options.entrypoints
if (!entrypoints || !Object.keys(entrypoints).length) {
  log.error('no entry points specified!')
  process.exit(1)
}

// setup the builder
var builder = Build(options)
builder.on('tree', function (tree, ms) {
  if (!tree) return
  log.info('tree'.grey, 'resolved in ' + (ms + 'ms').yellow)
})

// setup the entrypoints
Object.keys(entrypoints).forEach(function (entrypoint) {
  var name = path.basename(entrypoint)
  var opts = entrypoints[entrypoint]

  switch (path.extname(name)) {
  case '.js':
  case '.css':
    break
  default:
    log.error('entrypoint ' + name.red + ' is not supported. try only .js and .css files.')
    return
  }

  builder.add(entrypoint, opts)
  builder.on(entrypoint, function (string) {
    fs.writeFile(path.resolve(out, name), string, function (err) {
      if (err) throw err
      log.info('built'.grey, name.blue + ' ' + byteSize(string).yellow)
    })
  })
})

if (!options.watch) {
  co(function* () {
    yield* builder.build()
    yield builder.await('manifest')
    options.agent.close()
  })()
  return
}

builder.watch()

co(builder.build())()

function byteSize(string) {
  return bytes(Buffer.byteLength(string))
}
