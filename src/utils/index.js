const convertFile = require('./convert-file.js')
const translateFile = require('./translate-file.js')

module.exports = {
  ...convertFile,
  ...translateFile
}
