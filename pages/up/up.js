const DB = wx.cloud.database().collection("user")
const util = require('../../utils/util.js') 
let OPID = ""
let Title = ""
let Text = ""
let Img = ""
let NOTE = []

Page({
  data:{
    avatar:"",
    nickname:"",
    invalue:"",
    textvalue:"",
    img:"../../images/picture3.jpg"
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
    OPID = options.OPID
    DB.where({
      _openid: OPID
    }).get({
      success(res){
        console.log("up获取成功",res)
        that.setData({
          avatar: res.data[0].avatar,
          nickname: res.data[0].nickname
        })
      },fail(res){
        console.log("up获取失败",res)
      }
    })
  },
  getTitle(e){
    Title = e.detail.value
  },
  getText(e){
    Text = e.detail.value
  },
  //上传图片
  getImg(){
    wx.cloud.init({
      traceUser: true,
    })
    let that = this
    let timestamp = (new Date()).valueOf();
    wx.chooseImage({
      count:1,
      sizeType:['compressed'],
      sourceType:['album','camera'],
      success(chooseResult){
        wx.showLoading({
          title: '上传中。。。',
        })
        let size = chooseResult.tempFiles[0].size
        if(size >= 1000000){
          wx.hideLoading()
          wx.showModal({           
            title: '提示',            
            content: '图片大小不得超过1M',           
            showCancel: false,           
            success(res){},
            fail(res){console.log("Model error",res)}          
           })
        }else{
          // 将图片上传至云存储空间
          wx.cloud.uploadFile({
          // 指定上传到的云路径
          cloudPath: timestamp + '.png',
          // 指定要上传的文件的小程序临时文件路径
          filePath: chooseResult.tempFilePaths[0],
          // 成功回调
          success: res => {
            console.log('上传成功', res)
            wx.hideLoading()
            let imgUrl = res.fileID
              //通过云函数进行照片检测。
            wx.cloud.callFunction({
              name: "imageSafe",
              data:{
                fileID:imgUrl
              },success(res) {
                console.log("imageSafe请求成功。", res.result)
                if(res.result.errCode != 0){
                  wx.showModal({           
                  title: '警告',            
                  content: '照片敏感违规',           
                  showCancel: false,           
                  success: function (res) {}          
                 })
                 return
                }
              else{
                if (imgUrl) {
                  that.setData({
                    img:imgUrl
                  })
                 }
                Img = imgUrl
                wx.showToast({
                  title: '图片上传成功',
                })
              }
              },fail(res) {
                console.log("imageSafe请求失败。", res)
              }
            })
          },
        })
        }
      }
      })
  },
    //上传笔记
  up(){
      let that = this
      if(Title.length == 0){
        wx.showModal({
          title: '提示',            
          content: '标题不可为空',           
          showCancel: false,           
          success(res){},
          fail(res){console.log("Model fail",res)}  
        })
      }else{
          //数据监测
        let test = Title + Text
        wx.cloud.callFunction({
          name:"textSafe",
          data:{
            info:test
          },success(res){
            console.log("textSafe请求成功",res)
            let result = res.result
            wx.hideLoading()
            if(result == false){
              that.setData({
                invalue:"",
                textvalue:""
              })
              Text = ""
              Title = ""
              wx.showModal({
                title: '警告',            
                content: '内容敏感违规',           
                showCancel: false,           
                success(res){},
                fail(res){console.log("Model fail",res)}  
              })
            }else{
              DB.where({
                _openid: OPID
              }).get({
                success(res){
                  console.log("获取数据成功",res)
                  NOTE = res.data[0].notes
                  let id = res.data[0]._id
                  let time = util.formatTime(new Date())
                  let OOP = {}
                  OOP.title = Title
                  OOP.text = Text
                  OOP.image = Img
                  OOP.ispin = false
                  OOP.time = time
                  NOTE[NOTE.length] = OOP
                  DB.doc(id).update({
                    data:{
                      notes: NOTE
                    },success(res){
                      console.log("上传成功",res)
                      wx.showToast({
                        title: '笔记上传成功',
                      })
                      let timeOut = setTimeout(function(){
                        wx.redirectTo({
                          url: '../mytext/mytext?id='+OPID,      //OPID传入
                        })
                      })
                    },fail(res){
                      console.log("修改数据失败",res)
                      wx.showToast({
                        title: '上传失败',
                        icon:"none"
                      })
                    }
                  })
                },fail(res){
                  console.log("获取数据失败",res)
                  wx.showToast({
                    title: '上传失败',
                    icon:"none"
                  })
                }
              })
            }
          },fail(res){
            console.log("textSafe请求失败",res)
          }
        })
     }
  }
})