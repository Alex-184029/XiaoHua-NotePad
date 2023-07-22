const app = getApp()
const DB = wx.cloud.database().collection("user")   
let OPID = ""
let IsCreate = false
let Name = ""
let Avatar = ""

Page({
  data:{
    userInfo:{
      avatarUrl:"../../images/avator.png",   
      nickName:"未命名"
    },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
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
  onLoad(){
    let that = this
    if (app.globalData.userInfo) {
      console.log("获取成功1",app.globalData.userInfo)
        Name = app.globalData.userInfo.nickName
        Avatar = app.globalData.userInfo.avatarUrl
        that.setData({
          nickname:app.globalData.userInfo.nickName,
          avatar:app.globalData.userInfo.avatarUrl,
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
    } else{
      app.userInfoReadyCallback = res => {
        console.log("获取成功2",res)
        Name = res.userInfo.nickName
        Avatar = res.userInfo.avatarUrl
        that.setData({
          nickname:res.userInfo.nickName,
          avatar:res.userInfo.avatarUrl,
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } 
      //获取openid
    wx.cloud.callFunction({
      name: "getOpenid",
      success(res) {
        //console.log("请求数据成功。", res)
        OPID = res.result.openid
        DB.where({
          _openid: OPID
        }).get({
          success(res){
            //console.log("查询成功",res)
            if(res.data.length!=0){
              IsCreate = true
            }
          },fail(res){
            console.log("查询失败",res)
          }
        })
      },
      fail(res) {
        console.log("请求数据失败。", res)
      }
    })
  },
    //进入mytext并传入OPID
  inMy(){
    if(!this.data.hasUserInfo){
      wx.showToast({
        title: '请先点击“授权”',
        icon:'none'
      })
    }else if(!IsCreate){
      wx.showToast({
        title: '请先创建',
        icon:'none'
      })
    }else{
      wx.navigateTo({
        url: '../mytext/mytext?id='+OPID,      //OPID传入
      })
    }
  },
    //获取用户信息
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
    //创建
  createMy(){
    if(!this.data.hasUserInfo){
      wx.showToast({
        title: '请先点击“授权”',
        icon:'none'
      })
    }else if(IsCreate){
      wx.showToast({
        title: '创建过了，直接进入',
        icon:'none'
      })
    }else{
      wx.showLoading({
        title: '创建中。。。',
      })
      let notes = []
      DB.add({
        data:{
          nickname:Name,
          avatar:Avatar,
          notes:notes
        },success(res){
          console.log("创建成功",res)
          wx.hideLoading()
          wx.showToast({
            title: '创建成功',
          })
          let timeOut = setTimeout(function(){
            wx.navigateTo({
              url: '../mytext/mytext?id='+OPID,      //OPID传入
            })
          },1500)  
        },
        fail(res){
          console.log("创建失败",res)
        }
      })
     }
  }
})
