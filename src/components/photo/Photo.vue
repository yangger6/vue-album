<template>
  <div class="layout">
    <mu-snackbar v-if="snackbar" :message="tip" action="关闭" @actionClick="hideSnackbar" @close="hideSnackbar"/>
    <div class="content">
      <div class="content-left">
        <div class="logo">
          <h3>Tags</h3>
        </div>
        <mu-list @change="handleTagChange" :value="activeList" style="height: calc(100vh - 475px)">
            <mu-list-item :value="key" v-for="tag, key in tags" key="index" >
              <p slot="title" contenteditable="plaintext-only" spellcheck="false" class="tag-name" @focus="saveTagName($event)" @blur="saveTag($event, key)" @dragenter="dragenter($event)" @dragleave="dragleave($event)" @drop="allowDrop($event)" :id="key">
                {{tag.value}}
              </p>
              <mu-badge :content="String(tag.sum)" primary slot="after" style="padding-right: 16px" />
            </mu-list-item>
        </mu-list>
        <drag-upload @dragUpload="updateDragUpload"></drag-upload>
        <mu-raised-button class="demo-raised-button" style="margin: 50px;" labelPosition="before" icon="folder" label="uoload photo" @click="open('upload')"  primary/>
        <mu-dialog :open="dialog" title="Upload Photo">
          <mu-linear-progress v-if="uploading" />
          <form ref="form" enctype="multipart/form-data" style="position: relative;height: 200px">
            <p class="photo-type">1. allow img type <span>jpg</span>, <span>jpeg</span>, <span>png</span>, <span>bmp</span>, <span>gif</span></p><br>
            <p class="photo-type">2. Maximum size not exceeding <span>2M</span></p><br>
            <mu-text-field label="input photo name" labelFloat v-model="fileName" name="fileName" :errorText="inputErrorText" @textOverflow="handleInputOverflow" :maxLength="10" /><br/>
            <input type="file" name="photo" class="upload" id="photo"  ref="photo" accept="image/*">
            <mu-raised-button class="demo-raised-button" labelPosition="before" icon="folder" label="select file" style="z-index: 10" @click="selectFile" primary/>
            <input type="submit" value="提交" ref="sumbit" style="display: none">
          </form>
          <mu-flat-button slot="actions" @click="close('upload')" primary label="取消"/>
          <mu-flat-button slot="actions" primary @click="upload()" :disabled="!canUploadPhoto" label="确定"/>
        </mu-dialog>
      </div>
      <div class="content-right">
        <mu-dialog :open="dialogBatchMove" title="Batch Move">
          <batch-move :list="list" :tags="tags" :selectTag="activeList" @changePhotoList="changeTagAndList"></batch-move>
          <mu-flat-button slot="actions" @click="close('batch')" primary label="取消"/>
        </mu-dialog>
        <div class="header">
          <mu-sub-header>Photos in <span v-html="tagName(activeList)"></span></mu-sub-header>
        </div>
        <div class="body">
          <mu-content-block v-if="isLoading">
            <mu-circular-progress :size="60" :strokeWidth="5"/>
          </mu-content-block>
          <mu-content-block v-else>
            <mu-grid-list class="gridlist" :cols='photoCols'>
              <mu-sub-header>
                <span>Photos</span>
                <!--刷新-->
                <mu-flat-button label="Refresh" labelPosition="before" icon="autorenew" @click="refresh" primary/>
                <!--批量操作-->
                <mu-flat-button label="Batch Move" labelPosition="before" icon="create" @click="open('batch')" primary/>
                <!--显示图片信息-->
                <mu-switch label="Show Photo Info" v-model="showPhotoInfo" labelLeft />
              </mu-sub-header>
              <mu-grid-tile v-for="tile, index in list" :key="tile.id" class="photo-item" >
                <!--<img :src="'https://vue-album.herokuapp.com/api/image/' + tile.id" />-->
                <img :src="'http://localhost:5001/api/image/' + tile.id" @dragstart="drag(tile.id)" />
                <span slot="title" spellcheck="false" contenteditable="plaintext-only" @focus="savePhotoTitle($event)" @blur="updatePhotoTitle($event, tile.id)" >{{tile.title}}</span>
                <span slot="subTitle">Date:{{tile.date}} </span>
                <span slot="subTitle">
                  Tag: <b v-html="tagName(tile.tag)" spellcheck="false" contenteditable="plaintext-only" @blur="saveOrAddTag($event, tile)" ></b>
                </span>
              </mu-grid-tile>
            </mu-grid-list>
          </mu-content-block>
        </div>
        <div class="footer">
          <!--<mu-pagination :total="page.total" @pageSizeChange="handleClick" :defaultPageSize="page.defaultPageSize" :current="page.current" >-->
          <!--</mu-pagination>-->
          <mu-pagination :total="page.total" :current="page.current" @pageChange="handleClick" :defaultPageSize="page.defaultPageSize">
          </mu-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import posts from '@/unit/posts'
  import batchMove from '@/components/photo/batchMove/batchMove'
  import dragUpload from '@/components/photo/dragUpload/dragUpload'
  export default {
    data () {
      return {
        dialog: false,
        tip: '',
        fileName: '',
        photoTitle: '',
        show: false,
        showPhotoInfo: true, // 图片信息
        snackbar: false, // tip
        inputErrorText: '', // 图片名字报错提示
        dialogBatchMove: false, // 批量操作
        checkTagName: '', // 当前点击的TagName
        isLoading: true,  // 是否在loading
        uploading: false,
        activeList: '1',  // 当前的Tag
        dragPhotoId: null,  // 当前拖动的图片id
        photoCols: 4, // 一行显示多少图片
        // 标签
        tags: {
        },
        // 图片
        list: [],
        // 分页
        page: {
          current: 0,
          total: 0,
          defaultPageSize: 16
        }
      }
    },
    async created () {
      this.tags = await posts.getPhotoTags()
      await this.handleClick(1)
    },
    methods: {
      // 文字超长爆粗哟
      handleInputOverflow (isOverflow) {
        this.inputErrorText = isOverflow ? 'name is too long！！！！' : ''
      },
      /**
       * 隐藏tip
       */
      hideSnackbar () {
        this.snackbar = false
        this.tip = ''
        if (this.snackTimer) clearTimeout(this.snackTimer)
      },
      /**
       * @param tip 提示内容
       * @param seconds 时间
       * */
      showTip (tip, seconds) {
        this.tip = tip
        this.snackbar = true
        if (this.snackTimer) clearTimeout(this.snackTimer)
        this.snackTimer = setTimeout(() => { this.snackbar = false }, seconds || 3000)
      },
      /**
       * 修改Tag
       * @param val
       */
      handleTagChange (val) {
        this.activeList = val
      },
      /**
       * 跳页
       * @param newIndex 页数
       */
      async handleClick (newIndex) {
        this.isLoading = true
        this.page.current = newIndex
        var limit = this.page.defaultPageSize
        var offset = limit * (this.page.current - 1)
        if (newIndex === 1) offset = 0
        var result = await posts.getPhotosByTag(this.activeList, offset, limit)
        this.list = result
        this.page.total = Number(this.tags[this.activeList].sum)
        this.isLoading = false
        console.log('page size change event', newIndex)
      },
      saveTagName (e) {
        this.checkTagName = e.target.innerText
      },
      /**
       * 修改Tag的名字
       * @param e Tag的el
       * @param key
       */
      async saveTag (e, key) {
        if (this.checkTagName !== e.target.innerText) {
          if (key === '1') {
            e.target.innerText = this.tags[key].value
            this.checkTagName = ''
            this.showTip('can not change unTag Name')
            return
          }
          var result = await posts.updateTagName(key, e.target.innerText)
          if (result.code === '1') {
            this.tags[key].value = e.target.innerText
            this.activeList = key
            this.showTip(result.data)
          } else if (result.code === '-1') {
            this.showTip(result.data)
          }
        }
        this.checkTagName = ''
      },
        /**
       * 获取Tag名
       * @param key
       * @returns 返回Tag名
       */
      tagName (key) {
        return this.tags[key] ? this.tags[key].value : 'unTag'
      },
      /**
       * 更改图片的Tag或者新增Tag
       * @param e 图片el
       * @param tag 当前的Tag的key
       * @param id 当前图片的id
       */
      async saveOrAddTag (e, {tag, id}) {
        var changTagName = e.target.innerText.replace(/[\r\n]/g, '')
        var isNewTag = true
        var ischangeTag = false
        var selectKey = ''
        var selectTag = ''
        // 遍历tags
        Object.keys(this.tags).map(key => {
          // 如果当前的tags已经有了changTagName，那么不需要新增Tag
          if (this.tags[key].value === changTagName) {
            isNewTag = false
            // 如果有这个Tag的名，但是图片的tag与Tags的key不相同，则将这张图片的tag修改成所匹配的Tags的key 在这里面写await会摆错
            if (key !== tag) {
              selectKey = key
              selectTag = tag
              ischangeTag = true
            }
          }
        })
        if (ischangeTag) {
          var result = await posts.updatePhotoTag([id], selectKey)
          if (result.code === '1') {
            this.tags[selectTag].sum = (this.tags[selectTag].sum - 1).toString()
            this.tags[selectKey].sum = (this.tags[selectKey].sum - 0 + 1).toString()
            this.list = this.list.filter(p => p.id !== id)
            this.showTip(`success update photos title are ${JSON.stringify(result.data.successPhotos.msg)} ${result.data.errorPhotos}.`)
          }
        }
        // 如果是新的Tag，那么新增.
        if (isNewTag) {
          var newkey = String(new Date().getTime())
          this.tags[newkey] = {
            value: changTagName,
            sum: '1',
            canChange: true
          }
          var mewTag = await posts.addTagName(newkey, changTagName)
          if (mewTag.code === '1') {
            var res = await posts.updatePhotoTag([id], newkey)
            if (res.code === '1') {
              this.tags[tag].sum = (this.tags[tag].sum - 1).toString()
              this.list = this.list.filter(p => p.id !== id)
              this.showTip(`success update photos title are ${JSON.stringify(res.data.successPhotos.msg)} ${res.data.errorPhotos}.`)
            }
          }
        }
      },
      // 拖动时修改当前拖的图片ID
      drag (id) {
        this.dragPhotoId = id
      },
      // 修改样式
      dragenter (e) {
        e.target.parentElement.parentElement.className = 'mu-item-title-row tagName-selected'
      },
      // 拖拽离开
      dragleave (e) {
        e.preventDefault()
        e.target.parentElement.parentElement.className = 'mu-item-title-row'
      },
      // 托放完，修改图片的tag为拖放到的Tag的key
      async allowDrop (e) {
        e.preventDefault();
        [...document.querySelectorAll('.tagName-selected')].map(el => {
          el.className = 'mu-item-title-row'
        })
        let key = e.target.id
        let photo = this.list.find(photo => photo.id === Number(this.dragPhotoId))
        if (photo.tag === key) return
        var result = await posts.updatePhotoTag([photo.id], key)
        if (result.code === '1') {
          this.tags[photo.tag].sum = (this.tags[photo.tag].sum - 1).toString()
          this.tags[key].sum = (this.tags[key].sum - 0 + 1).toString()
          this.list = this.list.filter(p => p.id !== photo.id)
          this.showTip(`success update photos title are ${JSON.stringify(result.data.successPhotos.msg)} ${result.data.errorPhotos}.`)
        }
        this.refresh()
      },
      open (type) {
        if (type === 'upload') {
          this.dialog = true
        } else if (type === 'batch') {
          this.dialogBatchMove = true
        }
      },
      close (type) {
        if (type === 'upload') {
          this.dialog = false
        } else if (type === 'batch') {
          this.dialogBatchMove = false
        }
      },
      selectFile () {
        this.$refs.photo.click()
      },
      async upload () {
//           this.$refs.sumbit.click()
        let isCheckPhoto = this.$refs.photo && this.$refs.photo.value !== ''
        if (!isCheckPhoto) {
          this.showTip('please check photo')
          return
        }
        var formData = new FormData(this.$refs.form)
        this.uploading = true
        var result = await posts.uploadPhoto(formData)
        this.uploading = false
        if (result.code === '1') {
          this.showTip(`Picture uploaded successfully, name is : ${result.data.title}`)
          if (this.list.length < this.page.defaultPageSize && this.activeList === '1') {
            this.list.push(result.data)
          }
          if (this.activeList === '1') { // 如果当前是unTag，那么总数加+
            this.page.total ++
          }
          this.tags['1'].sum ++
          this.fileName = ''
          this.dialog = false
        } else if (result.code === '-1') {
          this.showTip(result.data, 5000)
          this.dialog = false
        }
      },
      changeTagAndList ({tagIndex, checkPhotos, msg}) {
        var changPhotosSum = checkPhotos.length
        if (changPhotosSum > 0) {
          this.tags[tagIndex].sum = String(Number(this.tags[tagIndex].sum) + changPhotosSum) // 修改后的tag数量操作
          this.tags[this.activeList].sum = String(Number(this.tags[this.activeList].sum) - changPhotosSum)// 原来的tag数量操作
          this.list = this.list.filter(({id}) => {
            // 如果list的id 不存在 改变的图片->checkPhotos 的 indexOf 里 那么保留
            return checkPhotos.indexOf(id) < 0
          })
        }
        this.showTip(msg) // 提示
        this.close('batch') // 关闭dialog
      },
      /**
       * 拖拽上传完更新数据
       */
      updateDragUpload (result) {
        if (result.code === '1') {
          this.showTip(`Picture uploaded successfully, name is : ${result.data.title}`)
          if (this.list.length < this.page.defaultPageSize && this.activeList === '1') {
            this.list.push(result.data)
          }
          if (this.activeList === '1') { // 如果当前是unTag，那么总数加+
            this.page.total ++
          }
          this.tags['1'].sum ++
          this.fileName = ''
        } else if (result.code === '-1') {
          this.showTip(result.data, 5000)
        }
      },
      refresh () {
        this.handleClick(this.page.current)
      },
      /**
       * 保存当前点击的图片title
       */
      savePhotoTitle (e) {
        this.photoTitle = e.target.innerText
      },
      async updatePhotoTitle (e, photoId) {
        var changeTitle = e.target.innerText
        if (changeTitle === this.photoTitle) return
        const result = await posts.updatePhotoTitle(photoId, changeTitle)
        if (result.code === '1') {
          this.list.find(({id}) => id === photoId).title = changeTitle
          this.showTip(`Photo update Title successfully,oldTile is : ${this.photoTitle} , changeTitle is : ${changeTitle}`, 3000)
        } else if (result.code === '-1') {
          this.showTip(result.data, 5000)
        }
      }
    },
    computed: {
      canUploadPhoto () {
        let isInput = this.inputErrorText === '' && this.fileName !== ''
        return isInput
      }
    },
    watch: {
      // 如果切换标签 ajax获取数据
      async activeList () {
        this.handleClick(1)
      },
      showPhotoInfo () {
        [...document.querySelectorAll('.mu-grid-tile.multiline .mu-grid-tile-titlebar')].map(el => {
          el.style.display = this.showPhotoInfo ? 'flex' : 'none'
        })
      }
    },
    components: {
      'batch-move': batchMove,
      'drag-upload': dragUpload
    }
  }
</script>
<style type="text/scss" lang="scss" >
  @import "photo.scss";
</style>
