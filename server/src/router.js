/**
 * Created by yangger on 2017/8/16.
 */
'use strict'
const express = require('express')
const router = express.Router()
const photo = require('./router/photo')
const tag = require('./router/tag')
const fs = require('fs')
const path = require('path')
const databesePath = '../database/photos.json'
// router
router.use(photo)
router.use(tag)

// get image
router.get('/image/:id', function (req, res) {
  var photoId = req.params.id
  if (photoId) {
    fs.readFile(path.join(__dirname, databesePath), function(err, data) { // 读取已存图片列表
      if (err) throw err;
      var photos = JSON.parse(data).photos
      var photoType = photos.filter(({id}) => id === Number(photoId))
      if (photoType.length > 0) { // 如果找到图片 设置http Content-Type 并且读取文件加载到页面中
        if (fs.existsSync(photoType[0].image)) {
          var img = fs.readFileSync(photoType[0].image)
          res.setHeader('Content-Type', photoType[0].fileType)
          res.end(img, 'binary')
          //fs.createReadStream(path.join(photoType[0].image)).pipe(res)
        } else {
          var img = fs.readFileSync(path.join(__dirname, '../../dist/static/noPhoto.png'))
          res.setHeader('Content-Type', 'image/png')
          res.end(img, 'binary')
        }
      } else {
        res.send(null)
      }
    })
  }
})

module.exports = router
