/**
 * Created by yangger on 2017/8/16.
 */
var express = require('express')
var bodyParser = require('body-parser');
var apiRouter = require('./src/router')
var path = require('path')
var app = express()
app.use(bodyParser.json());
 app.use(express.static(path.join(__dirname,'../dist')))
app.use('/api', apiRouter);
app.use(function (err, req, res, next) {
  // 文件巨大
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.send({ code: '-1', data: 'File is too big' })
    return
  }
  // Handle any other errors
})
var server = app.listen(5001, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
})
