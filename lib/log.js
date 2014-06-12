
require('colors')

var maxlength = 10

exports.info = function (name, description) {
  console.log(pad(name) + ' ' + description)
}

exports.error = function (name, description) {
  if (!description) {
    description = name
    name = 'error'.red
  }
  console.error(pad(name) + ' ' + description)
}

function pad(string) {
  var length = lengthOf(string)
  var i = maxlength - length
  while (i-- > 0) string = ' ' + string
  return string
}

// length of a string without color codes
function lengthOf(string) {
  string = string.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '')
  return Buffer.byteLength(string)
}
