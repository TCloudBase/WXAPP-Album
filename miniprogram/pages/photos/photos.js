const app= getApp()
const db = wx.cloud.database()
const _ = db.command
Page({
    albumId: undefined,
    data: {
        albumIndex: '',
        photoIds: []
    },
    onLoad (options) {
        this.albumId = options.id
    },
    onShow () {
        this.getPhotos()
    },
    addphoto(e) {
      wx.navigateTo({
        url: '/pages/photos/add?id=' + this.albumId,
      })
    }, 
    async getPhotos () {
        const userinfo = await db.collection('user').doc(app.globalData.id).get()
        const albums = userinfo.data.albums;
        const photos = albums[this.albumId].photos;
        app.globalData.allData.albums[this.albumId].photos = photos
        const photoIds = photos.map(photo => photo.fileID)
        this.setData({
            albumIndex: this.albumId,
            photoIds
        })
        wx.hideLoading()
    },
    async previewImage (e) {
        const currentIndex = e.currentTarget.dataset.index
        const currentUrl = this.data.photoIds[currentIndex]
        wx.previewImage({
            current: currentUrl,
            urls: this.data.photoIds
        })
    },
    deletePic(e) {
        let that = this;
        wx.showModal({
          title:'确认删除',
          content:'是否确认此操作？删除后的图片无法还原',
          async success(res){
            if(res.confirm){
              wx.showLoading({
                title: '删除中',
                mask:true
              })
              let index = e.currentTarget.dataset.index // 获取索引
              let photos = app.globalData.allData.albums[that.albumId].photos // 获取相册列表
              const photo = photos[index] //将删除的图片
              photos.splice(index, 1) // 把相册列表中对应索引的照片删除
  
              let datalog = await db.collection('user').doc(app.globalData.id).update({ // 更新到云数据
                data: {
                  albums: _.set(app.globalData.allData.albums)
                }
              })
              let filelog = await wx.cloud.deleteFile({ // 删除文件图片
                  fileList:[photo.fileID]
              })
              that.getPhotos() // 重新渲染页面
            }
          }
        })
    }
})
