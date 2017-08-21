/**
 * Created by yangger on 2017/8/16.
 */
'use strict'
var multer = require('multer')
var path = require('path')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'../../dist/static'))
  },
  filename: function (req, file, cb) {
    var fileName = fileName || file.fieldname
    cb(null, fileName + '-' + Date.now())
  }
})
var upload = multer({
  storage: storage ,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
})
module.exports = upload
