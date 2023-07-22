const DB = wx.cloud.database().collection("user")
let OPID = ''
let LIST = []
let SearData = ''
let Index = 0
let Array = []

Page({
  data:{
    InputData: '',
    DataList: [],
    avatar:'',
    nickname:'',
    array:[],
  },
    //分享
    onShareAppMessage: function (res) {
      return {
        title: '小华记事本',
        path: '/pages/index/index',
        imageUrl:'/images/note.png'
      }
    },
      //分享到朋友圈
    onShareTimeline(res){
      return {
        title: '小华记事本',
        path: '/pages/index/index',
        imageUrl:'/images/note.png'
      }
    },
  onLoad(options){
    let that = this
    OPID = options.id
    DB.where({
      _openid: OPID
    }).get({
      success(res){
        console.log("mytext获取成功",res)
        LIST = res.data[0].notes
        let notes = []
        for(let i=LIST.length-1;i>=0;i--){
          if(LIST[i].ispin){
            notes[notes.length] = LIST[i]
          }
        }
        for(let i=LIST.length-1;i>=0;i--){
          if(!LIST[i].ispin){
            notes[notes.length] = LIST[i]
          }
        }
        that.setData({
          DataList: notes,
          avatar: res.data[0].avatar,
          nickname: res.data[0].nickname
        })
        if(notes.length === 0){
          wx.showToast({
            title: '点击加号添加',
            icon:'none'
          })
        }
        LIST = notes
      },fail(res){
        console.log("mytext获取失败",res)
      }
    })
  },
    //下拉刷新
  onPullDownRefresh: function () {
    wx.startPullDownRefresh()
    let timeOut = setTimeout(()=>{
      wx.stopPullDownRefresh()
    },2000)
    let that = this
    DB.where({
      _openid: OPID
    }).get({
      success(res){
        console.log("下拉刷新成功",res)
        LIST = res.data[0].notes
        let notes = []
        for(let i=LIST.length-1;i>=0;i--){
          if(LIST[i].ispin){
            notes[notes.length] = LIST[i]
          }
        }
        for(let i=LIST.length-1;i>=0;i--){
          if(!LIST[i].ispin){
            notes[notes.length] = LIST[i]
          }
        }
        that.setData({
          DataList: notes,
          avatar: res.data[0].avatar,
          nickname: res.data[0].nickname
        })
        LIST = notes
      },fail(res){
        console.log("下拉刷新失败",res)
      }
    })
    wx.showToast({
      title: '刷新完成',
    })
  },
  searchInp(e){
    SearData = e.detail.value
  },
  goDetail(e){
    let object = e.currentTarget.dataset.item
    object.id = OPID
    wx.redirectTo({
     url: '../detail/detail?object='+JSON.stringify(object),
    })
  },
  goUp(){
    wx.redirectTo({
      url: '../up/up?OPID='+OPID,
    })
  },
  bindPickerChange(e) {
    if(Array.length != 0){
      let that = this
      Index = e.detail.value
      let i = 0
      for(;i<LIST.length;i++){
        if(Array[Index] == LIST[i].title){
          break;
        }
      }
      Array = []
      console.log(LIST[i])
      that.setData({
        InputData: '',
        array:[]
      })
      wx.redirectTo({
        url: '../detail/detail?object='+JSON.stringify(LIST[i]),
       })
    }
  },
  blurInp(){
    let that = this
      //利用字符串包含方法，实现一个简单的模糊搜索。
    for(let i=0;i<LIST.length;i++){
      if(LIST[i].title.indexOf(SearData)!=-1||LIST[i].text.indexOf(SearData)!=-1){
        console.log(LIST[i].title)
        Array[Array.length] = LIST[i].title
      }
    }
    console.log("Array:",Array)
    that.setData({
      array:Array
    })
    if(Array.length == 0){
      console.log("搜索失败")
      wx.showToast({
        title: '没有搜索到结果',
        icon:'none'
      })
    }
  }
})