var spawn = require('child_process').spawn

// {
//   baseUrl: '',
//   paths: [],
//   iterations: 10,
//   parallel: 4
// }

// function init(config) {
//   for (var i = 0; i < config.parallel; i++) {

//   }
// }

module.exports = parse


var page = require('webpage').create()

var output = []
var relevanceRe = /[time|total queries]:/gi
var captureRe   = /^[a-z\s]+:\s*([0-9\.s]+)/igm

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  if (relevanceRe.test(msg)) {
    console.log(getMatches(msg, captureRe))
  }
};

page.open('http://lupus-resource-center.dev:3000', function(status) {
  phantom.exit()
})

function getMatches(string, regex, index) {
  index || (index = 1)

  var matches = []
  var match

  while (match = regex.exec(string)) {
    matches.push(match[index])
  }

  return matches
}
