const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  isLoaded: false,
  data: {
    albums: [],
    inputValue: '',
    dialogShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    error: ''
  },
  onLoad() {
    this.checkUser();
  },
  onShow() {
    if (this.isLoaded) {
      this.getAlbums()
    }
  },
  async checkUser() {
    const user = await db.collection('user').get()
    if (!user.data.length) {
      let result = await db.collection('user').add({
        data: {
          albums: []
        }
      })
      app.globalData.id = result._id;
      app.globalData.allData.albums = [];
      this.getAlbums([]);
    }
    else{
      const userinfo = user.data[0];
      app.globalData.id=userinfo._id;
      app.globalData.allData.albums = userinfo.albums;
      this.getAlbums(userinfo.albums);
    }
  },
  async getAlbums(albumsParam) {
    const albums = albumsParam || app.globalData.allData.albums
    for (const album of albums) {
      if (!album) {
        continue;
      }
      if (album.photos.length) {
        album.coverURL = album.photos[0].fileID;
      }else{
        album.coverURL = "../../images/default-cover.png"
      }
    }
    this.setData({ 
      albums 
    })
    this.isLoaded = true
  },
  addalbum(e) {
    this.setData({
      dialogShow: true,
    })
  },
  keyInput(e) {
    this.setData({ 
      inputValue: e.detail.value 
    })
  },
  async formSubmit(e) {
    if (e.detail.index == 1) {
      let albumName = this.data.inputValue
      if (!!albumName) {
        app.globalData.allData.albums.push({ albumName: albumName, photos: [] })
        let result = await db.collection('user').doc(app.globalData.id).update({
          data: { 
            albums: _.set(app.globalData.allData.albums)
          }
        })
        this.setData({
          dialogShow: false,
        })
        this.getAlbums(app.globalData.allData.albums);
      } else {
        wx.showToast({
          title: '相册名不能为空',
          icon:'none'
        })
      }
    }else {
      this.setData({
        dialogShow: false,
      })
    }
  }
})
