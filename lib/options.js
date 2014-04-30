
var transforms = require('normalize-transforms')
var agent = require('normalize-agent')
var resolve = require('path').resolve

module.exports = Options

// note: options are DEFAULTS and do not overwrite .rc files
function Options(options) {
  options = options || {}
  require('rc')('nlz', options)

  // build folders
  options.directory = resolve(options.directory || 'repositories')
  options.out = resolve(options.out || 'build')

  // resolve the proxy hostname
  options.proxy = options.proxy || 'nlz.io'
  if (~options.proxy.indexOf(':')) { // proxy with a port
    options.hostname = options.proxy.split(':')[0]
    options.port = options.proxy.split(':')[1]
  } else {
    options.hostname = options.proxy
    options.port = 443 // getting errors for some reason if i don't specify this
  }
  // avoid self-signed certificate errors
  options.rejectUnauthorized = options.rejectUnauthorized === true
    || options['self-signed'] === true
  // create an agent automatically
  options.agent = agent(options)

  // normalize options
  options.transforms = options.transforms || Object.create(transforms.options)

  // resolve entry points
  // either an array of files or object of files -> options
  var entrypoints = options.entrypoints || options.entrypoint
  if (entrypoints) {
    options.entrypoints = Options.entrypoints(entrypoints)
    delete options.entrypoint
  }

  return options
}

Options.entrypoints = function (entrypoints) {
  // single entry point... WHY?!?!
  if (typeof entrypoints === 'string') entrypoints = [entrypoints]

  // array of entry points
  if (Array.isArray(entrypoints)) {
    var buf = {}
    entrypoints.forEach(function (entrypoint) {
      buf[resolve(entrypoint)] = {}
    })
    return buf
  }

  // map of entrypoints and options
  if (typeof entrypoints === 'object') return entrypoints

  throw new TypeError('entrypoints must be a single string, an array of strings, or hash-option lookup object.')
}
