
/**
 * Common `normalize-build` instance creation.
 */

var Build = require('normalize-build')
var Options = require('normalize-rc')
var log = require('normalize-log')
var chalk = require('chalk')
var path = require('path')

module.exports = function (program, options) {
  // overwrite .rc file's entrypoints
  if (program.args.length) options.entrypoints = Options.entrypoints(program.args)

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
    log.info(chalk.grey('tree'), 'resolved in ' + chalk.yellow(ms + 'ms'))
  })

  builder.on('manifest', function (manifest, filename, ms) {
    filename = path.relative(process.cwd(), filename)
    log.info(chalk.grey('manifest'), 'written to '
      + chalk.grey(filename)
      + ' in ' + chalk.yellow(ms + 'ms'))
  })

  Object.keys(entrypoints).forEach(function (entrypoint) {
    var name = path.basename(entrypoint)
    var opts = entrypoints[entrypoint]

    switch (path.extname(name)) {
    case '.js':
    case '.css':
      break
    default:
      log.error('entrypoint ' + chalk.red(name) + ' is not supported. try only .js and .css files.')
      delete entrypoints[entrypoint]
      return
    }

    builder.add(entrypoint, opts)
  })

  return builder
}
