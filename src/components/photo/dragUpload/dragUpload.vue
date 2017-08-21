<template>
  <mu-paper class="drag-upload-paper" ref="dragUpload" :zDepth="zDepth">
    <mu-linear-progress v-if="uploading" />
    <img :src="uploadSrc" alt="">
  </mu-paper>
</template>
<style scoped rel="stylesheet/scss" lang="scss">
  @import "dragUpload.scss";
</style>
<script>
  import posts from '@/unit/posts'
  export default{
    data () {
      return {
        el: null,
        uploading: false,
        uploadSrc: '',
        zDepth: 2
      }
    },
    mounted () {
      this.el = this.$refs.dragUpload.$el
      const that = this // 把Vue保存在变量中以供使用
      // 我也不想写原生啊= =。但是@drag***监听不到外部拖进来的文件
      this.el.addEventListener('dragenter', function (e) { // 拖拽进去
        e.preventDefault()
        that.dragenterPhoto()
      })
      this.el.addEventListener('dragover', function (e) { // 拖拽时
        // 不让拖拽进来的文件打开新页面
        e.preventDefault()
      })
      this.el.addEventListener('dragleave', function (e) { // 拖拽离开
        e.preventDefault()
        that.dragleavePhoto()
      })
      this.el.addEventListener('drop', async function (e) { // 松开
        e.preventDefault()
        var files = e.dataTransfer.files
        const allowed = ['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/gif']
        if (files.length > 0) {
          var file = files[0]
          var fileType = file.type
          if (allowed.indexOf(fileType) < 0) { // 文件不在允许的范围内
            that.$emit('dragUpload', {
              colde: '-1',
              data: `Dont't upload another type file`
            })
            that.uploadSrc = false
            that.zDepth = 2
            return
          }
          if (file.size > 2 * 1024 * 1024) { // 文件太大
            that.$emit('dragUpload', {
              colde: '-1',
              data: `File is too big`
            })
            that.uploadSrc = false
            that.zDepth = 2
            return
          }
          that.reader(file) // 加载图片
          that.uploading = true
          var fileName = file.name.replace(/(.*\/)*([^.]+).*/ig, '$2')
          var formData = new FormData()
          formData.append('fileName', fileName)
          formData.append('photo', file)
          const result = await posts.uploadPhoto(formData)
          that.$emit('dragUpload', result)
          that.uploading = false
          that.uploadSrc = false
          that.zDepth = 2
        }
      })
    },
    methods: {
      dragenterPhoto () {
        this.zDepth = 5
      },
      dragleavePhoto () {
        this.zDepth = 2
      },
      reader (file) {
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function () {
          this.uploadSrc = reader.result
        }.bind(this)
      }
    }
  }
</script>
