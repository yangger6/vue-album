/**
 * Created by yangger on 2017/8/21.
 */
'use strict'
const express = require('express')
const router = express.Router()
const databesePath = '../../database/photos.json'
const fs = require('fs')
const path = require('path')
router.post('/tag/select', function(req, res) {
  fs.readFile(path.join(__dirname, databesePath), function(err, data) {
    if (err) throw err;
    var result = JSON.parse(data).tags
    res.send(result)
  })
})
router.post('/tag/select', function(req, res) {
  fs.readFile(path.join(__dirname, databesePath), function(err, data) {
    if (err) throw err;
    var result = JSON.parse(data).tags
    res.send(result)
  })
})
router.post('/tag/update', function(req, res) {
  var key = req.body.id
  if (key === '1') {
    return res.send({code:'-1', data: "can't not change unTag !"})
  }
  var tagName = req.body.tagName
  fs.readFile(path.join(__dirname, databesePath), function(err, data) {
    if (err) throw err;
    var result = JSON.parse(data)
    var tag = result.tags[key]
    if(tag) tag.value = tagName
    fs.writeFile(path.join(__dirname, databesePath), JSON.stringify(result), function(err, data) {
      if (err) throw err;
      console.log("Update Tag Success!");
      res.send({code: '1', data: "Update Tag Success!"})
    })
  })
})
router.post('/tag/add', function(req, res) {
  var value = req.body.tagName
  var id = req.body.id
  fs.readFile(path.join(__dirname, databesePath), function(err, data) {
    if (err) throw err;
    var result = JSON.parse(data)
    result.tags[id] = { value: value, sum: "0",canChange: true }
    fs.writeFile(path.join(__dirname, databesePath), JSON.stringify(result), function(err, data) {
      if (err) throw err;
      console.log("Add Tag Success!");
      res.send({code: '1'})
    })
  })
})
module.exports = router
