/**
 * Created by yangger on 2017/8/21.
 */
'use strict'
const express = require('express')
const router = express.Router()
const readChunk = require('read-chunk');
const fileType = require('file-type');
const databesePath = '../../database/photos.json'
const fs = require('fs')
const path = require('path')
const upload = require('../upload')
// upload photo
router.post('/photos/upload', upload.single('photo'), function (req, res) {
  var file = req.file;
  console.log('文件类型：%s', file.mimetype);
  console.log('原始文件名：%s', file.originalname);
  console.log('文件大小：%s', file.size);
  console.log('文件保存路径：%s', file.path);
  var accessImage = ['image/bmp','image/jpeg','image/jpg','image/gif','image/png']
  if (accessImage.indexOf(file.mimetype) < 0 ) {
    fs.unlink(file.path)
    res.send({code: '-1',data: "Dont't upload another type file"})
    return
  }
  var buffer = readChunk.sync(file.path, 0, 4100);
  var isChangeMime = fileType(buffer) && fileType(buffer).mime === file.mimetype;
  // 修改文件后缀搞事的家伙 直接删掉
  if(!isChangeMime) {
    fs.unlink(file.path)
    res.send({code: '-1',data: "Dont't upload another type file"})
  } else if (isChangeMime) {
    fs.readFile(path.join(__dirname, databesePath), function(err, data) {
      if (err) throw err;
      var result = JSON.parse(data)
      var newPhoto = {
        date: new Date().toLocaleDateString(),
        id: new Date().getTime() + Math.floor(Math.random()*10000),
        image: file.path,
        tag: "1",
        fileType: file.mimetype,
        title: req.body.fileName.slice(0, 10) || ''
      }
      result.photos.push(newPhoto)
      if (result.tags["1"]) result.tags["1"].sum = String(result.tags["1"].sum - 0 + 1)
      fs.writeFile(path.join(__dirname, databesePath), JSON.stringify(result), function(err, data) {
        if (err) throw err;
        console.log("Upload Photo Success!");
        res.send({code: '1',data: newPhoto})
      })
    })
  }
})

router.post('/photos/select', function(req, res) {
  var selectTag = req.body.Tag
  var offset = req.body.offset
  var limit = req.body.limit
  fs.readFile(path.join(__dirname, databesePath), function(err, data) {
    if (err) throw err;
    var result = JSON.parse(data).photos.filter(({tag}) => tag === selectTag).slice(offset, offset + limit)
    res.send(result)
  })
})
router.post('/photos/updateTag', function(req, res) {
  var photoIds = req.body.id || []
  var newTag = req.body.tag
  var successPhotos = {
    id: [],
    msg: []
  }
  var errorPhotos = []
  fs.readFile(path.join(__dirname, databesePath), function(err, data) {
    if (err) throw err;
    var result = JSON.parse(data)
    photoIds.map(photoId => {
      var photo = result.photos.find(({id}) => id === Number(photoId))
      if (photo) {
        if (result.tags[photo.tag]) result.tags[photo.tag].sum = String(result.tags[photo.tag].sum - 1)
        if (result.tags[newTag]) result.tags[newTag].sum = String(result.tags[newTag].sum - 0 + 1)
        photo.tag = newTag
        successPhotos.id.push(photo.id)
        successPhotos.msg.push(photo.title)
      }else {
        errorPhotos.push(photoId)
      }
    })
    if (successPhotos.id.length > 0 ) {
      fs.writeFile(path.join(__dirname, databesePath), JSON.stringify(result), function(err) {
        if (err) throw err;
        console.log("Update Photo Success!");
      })
      res.send({
        code: '1',
        data: {
          successPhotos: successPhotos,
          errorPhotos: errorPhotos.length > 0 ? ` , update error by : ${JSON.stringify(errorPhotos)}` : ''
        }
      })
    } else if (errorPhotos.length > 0 && successPhotos.id.length === 0) {
      res.send({code: '-1', data: `update error by : ${JSON.stringify(errorPhotos)}`})
    }
  })
})
router.post('/photos/updateTitle', function(req, res) {
  var photoId = req.body.id
  var newTitle = req.body.title
  if (newTitle && photoId) {
    fs.readFile(path.join(__dirname, databesePath), function(err, data) {
      if (err) throw err;
      var result = JSON.parse(data)
      var photo  = result.photos.find(({id}) => id === Number(photoId))
      if (!photo) {
        res.send({code: '-1', data: `photo can not find by : ${photoId}`})
        return
      }
      photo.title = newTitle
      fs.writeFile(path.join(__dirname, databesePath), JSON.stringify(result), function(err, data) {
        if (err) throw err;
        console.log("change Photo Title Success!");
        res.send({code: '1'})
      })
    })
  }
})
module.exports = router

