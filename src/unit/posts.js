/**
 * Created by yangger on 2017/8/14.
 */
import axios from 'axios'
const url = 'http://localhost:5001' // 处理请求地址
// const url = 'https://vue-album.herokuapp.com' // 处理请求地址
export default class posts {
  static async getPhotoTags () {
    try {
      const res = await axios.post(`${url}/api/tag/select`)
      if (res.statusText === 'OK' && res.status === 200) {
        return res.data
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
  static async getPhotosByTag (tag, offset, limit) {
    try {
      const res = await axios.post(`${url}/api/photos/select`, {
        Tag: tag,
        offset: offset,
        limit: limit
      })
      if (res.statusText === 'OK' && res.status === 200) {
        return res.data
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
  static async updateTagName (key, newTagName) {
    try {
      const res = await axios.post(`${url}/api/tag/update`, {
        id: key,
        tagName: newTagName
      })
      if (res.statusText === 'OK' && res.status === 200) {
        return res.data
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
  static async addTagName (key, newTagName) {
    try {
      const res = await axios.post(`${url}/api/tag/add`, {
        id: key,
        tagName: newTagName
      })
      if (res.statusText === 'OK' && res.status === 200) {
        return res.data
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
  static async uploadPhoto (formData) {
    try {
      const res = await axios({
        url: `${url}/api/photos/upload`,
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (res.statusText === 'OK' && res.status === 200) {
        return res.data
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
  static async updatePhotoTag (id, tag) {
    try {
      const res = await axios.post(`${url}/api/photos/updateTag`, {
        id: id,
        tag: tag
      })
      if (res.statusText === 'OK' && res.status === 200) {
        return res.data
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
  static async updatePhotoTitle (id, changeTitle) {
    try {
      const res = await axios.post(`${url}/api/photos/updateTitle`, {
        id: id,
        title: changeTitle
      })
      if (res.statusText === 'OK' && res.status === 200) {
        return res.data
      }
      return []
    } catch (e) {
      console.log(e)
      return []
    }
  }
}
