
var program = require('commander')

program._name = 'nlz build'
program
  .version(require('../package.json').version)
  .usage('[options] entrypoints...')
  .option('-w, --watch', 'watch for file changes and rebuild automatically')
  .option('-o, --out <dir>', 'output directory')
  .parse(process.argv)

var Build = require('normalize-build')
var bytes = require('bytes')
var path = require('path')
var fs = require('fs')
var co = require('co')

var options = require('../lib/options')(program)
var out = options.out
require('mkdirp').sync(out)

var builder = Build(options)
builder.on('tree', function (_, ms) {
  console.log('tree: resolved in ' + ms + 'ms')
})

var entrypoints = program.args.map(function (entrypoint) {
  return path.resolve(entrypoint)
})

if (!entrypoints.length) {
  console.error('error: no entrypoints specified!')
  process.exit(1)
}

entrypoints.forEach(function (entrypoint) {
  var name = path.basename(entrypoint)

  switch (path.extname(name)) {
  case '.js':
  case '.css':
    break
  default:
    console.error('error: entrypoint ' + name + ' is not supported. try only .js and .css files.')
    return
  }

  builder.add(entrypoint)
  builder.on(entrypoint, function (res) {
    fs.writeFile(path.resolve(out, name), res, function (err) {
      if (err) throw err
      console.log('built: ' + name + ' (' + bytes(Buffer.byteLength(res)) + ')')
    })
  })
})

if (!options.watch) {
  co(function* () {
    yield* builder.build()
    options.agent.close()
  })()
  return
}

builder.watch()

co(function* () {
  yield* builder.build()
})()
