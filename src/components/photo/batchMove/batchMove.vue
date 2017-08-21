<template>
  <div class="demo-vsteper-container">
    <mu-stepper :activeStep="activeStep" orientation="vertical">
      <mu-step>
        <mu-step-label>
          select Photos
        </mu-step-label>
        <mu-step-content>
          <p>
            check you need to move photos title
          </p>
          <div style="height: 300px;overflow-y: scroll;">
            <mu-chip class="batch-chip" v-for="photo in list" @click="checkPhoto(photo.id)" key="photo.id">
              <mu-avatar class="batch-chip-img" :size="99" :src="'http://localhost:5001/api/image/' + photo.id"/>
              <mu-checkbox name="group" :nativeValue="String(photo.id)" v-model="checkPhotos" :label="'title: ' + photo.title" class="checkbox"/>
            </mu-chip>
          </div>
          <br>
          <mu-raised-button style="margin-top: 15px;" label="Next" class="demo-step-button" @click="handleNext" :disabled="!isChoosePhoto" primary/>
        </mu-step-content>
      </mu-step>
      <mu-step>
        <mu-step-label>
          choose Tag
        </mu-step-label>
        <mu-step-content>
          <mu-select-field v-model="tagIndex" :labelFocusClass="['label-foucs']" label="choose these photos Tag">
            <mu-menu-item v-for="tag,index in tags" :key="index" :value="index" :title="tag.value" :disabled="index === selectTag" primary  />
          </mu-select-field>
          <br>
          <mu-raised-button label="Next" class="demo-step-button" @click="handleNext" :disabled="tagIndex === ''" primary/>
          <mu-flat-button label="Back" class="demo-step-button" @click="handlePrev"/>
        </mu-step-content>
      </mu-step>
      <mu-step>
        <mu-step-label>
          Confirm Choices
        </mu-step-label>
        <mu-step-content>
          <p>
            you choose photos title is [<span class="photo-title" v-for="checkPhoto in checkPhotosTitle"> {{checkPhoto.title}} </span>]
          </p>
          <p class="batch-tag">
            you choose Tag  is <span>{{checkTagName.value}}</span>
          </p>
          <p class="batch-ok">
            Click <b>OK</b> to confirm your changes
          </p>
          <mu-raised-button label="OK" @click="handleNext" primary/>
          <mu-flat-button label="Back" @click="handlePrev"/>
        </mu-step-content>
      </mu-step>
    </mu-stepper>
    <p v-if="finished">
      <mu-linear-progress/>
    </p>
  </div>
</template>
<style lang="scss" type="text/scss">
  @import "batchMove.scss";
</style>
<script>
  import posts from '@/unit/posts'
  export default {
    data () {
      return {
        activeStep: 0,
        tagIndex: '',
        checkPhotos: []
      }
    },
    computed: {
      finished () {
        return this.activeStep > 2
      },
      isChoosePhoto () {
        return this.checkPhotos.length > 0
      },
      checkTagName () {
        return this.tagIndex && this.tags[this.tagIndex]
      },
      checkPhotosTitle () {
        return this.list.filter(({id}) => this.checkPhotos.indexOf(String(id)) > -1)
      }
    },
    methods: {
      async handleNext () {
        this.activeStep++
        if (this.finished) {
          const result = await posts.updatePhotoTag(this.checkPhotos, this.tagIndex)
          if (result.code === '1') {
            this.$emit('changePhotoList', {
              tagIndex: this.tagIndex,
              checkPhotos: result.data.successPhotos.id,
//              msg: ('success update photos title are ' + JSON.stringify(result.data.successPhotos.msg) + result.data.errorPhotos)
              msg: `success update photos title are ${JSON.stringify(result.data.successPhotos.msg)} ${result.data.errorPhotos}.`
            })
          } else if (result.code === '-1') {
            this.$emit('changePhotoList', {
              tagIndex: this.tagIndex,
              checkPhotos: [],
              msg: result.data
            })
          }
        }
      },
      handlePrev () {
        this.activeStep--
      },
      reset () {
        this.activeStep = 0
      },
      checkPhoto (id) {
        document.querySelector(`input[value='${id}']`) && document.querySelector(`input[value='${id}']`).click()
      }
    },
    props: {
      list: Array,
      tags: Object,
      selectTag: String
    }
  }
</script>
