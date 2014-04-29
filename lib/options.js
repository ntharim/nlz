
var resolve = require('path').resolve

module.exports = function (options) {
  options = options || {}
  require('rc')('nlz', options)

  options.directory = resolve(options.directory || 'repositories')
  options.out = resolve(options.out || 'build')
  options.proxy = options.proxy || 'nlz.io'
  if (~options.proxy.indexOf(':')) {
    options.hostname = options.proxy.split(':')[0]
    options.port = options.proxy.split(':')[1]
  } else {
    options.hostname = options.proxy
  }
  options.rejectUnauthorized = false
  options.agent = require('normalize-agent')(options)
  return options
}
