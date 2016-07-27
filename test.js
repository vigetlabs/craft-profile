var page = require('webpage').create()

page.settings.javascriptEnabled = false
page.settings.loadImages = false

var output      = []
var relevanceRe = /Time:|Total Queries:/g
var captureRe   = /^[a-z\s]+:\s+([0-9\.s]+)/igm

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
