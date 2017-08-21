import Vue from 'vue'
import Router from 'vue-router'
import Photo from '@/components/photo/Photo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Photo',
      component: Photo
    }
  ]
})
