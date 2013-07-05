var express = require('express');

var app = express.createServer(express.logger());

fs = require('fs');
var buff = fs.readFileSync('index.html');

app.get('/', function(request, response) {
  response.send(buff.toString('utf8', 0, buff.length));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
