
var program = require('commander')

program._name = 'nlz build'
program
  .usage('[options] [entrypoints...]')
  .option('-w, --watch', 'watch for file changes and rebuild automatically')
  .option('-o, --out <dir>', 'output directory')

program.parse(process.argv)

var Build = require('normalize-build')
var bytes = require('bytes')
var path = require('path')
var fs = require('fs')
var co = require('co')

var Options = require('../lib/options')

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
  console.error('error: no entrypoints specified!')
  process.exit(1)
}

// setup the builder
var builder = Build(options)
builder.on('tree', function (tree, ms) {
  if (!tree) return
  console.log('tree: resolved in ' + ms + 'ms')
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
    console.error('error: entrypoint ' + name + ' is not supported. try only .js and .css files.')
    return
  }

  builder.add(entrypoint, opts)
  builder.on(entrypoint, function (string) {
    fs.writeFile(path.resolve(out, name), string, function (err) {
      if (err) throw err
      console.log('built: ' + name + ' - ' + byteSize(string))
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
