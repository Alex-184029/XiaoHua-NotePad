const DB = wx.cloud.database().collection("user") 
let DuiXiang = {}
let OPID = ""
let Title = ""
let Text = ""
let Img = ""
let NOTE = []
let ID = ""
let IsPin = false

Page({
  data:{
    title:'',
    text:'',
    img:'../../images/picture3.jpg',
    avatar:"",
    nickname:"",
    ispin:"../../images/notpin.png",
    timestamp:""
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
    //页面加载：获取传入字符串对象
  onLoad(options){
    let that = this
    DuiXiang = JSON.parse(options.object)
    if(DuiXiang.image.length==0){
      that.setData({
        title:DuiXiang.title,
        text:DuiXiang.text,
        timestamp:DuiXiang.time
      })
    }else{
      that.setData({
        title:DuiXiang.title,
        text:DuiXiang.text,
        img:DuiXiang.image,
        timestamp:DuiXiang.time
      })
      Img = DuiXiang.image
    }
    IsPin = DuiXiang.ispin
    if(IsPin){
      that.setData({
        ispin:"../../images/ispin.png"
      })
    }
    Title = DuiXiang.title
    Text = DuiXiang.text
    OPID = DuiXiang.id
    DB.where({
      _openid: OPID
    }).get({
      success(res){
        console.log("detail获取成功",res)
        that.setData({
          avatar: res.data[0].avatar,
          nickname: res.data[0].nickname,
        })
        NOTE = res.data[0].notes
        ID = res.data[0]._id
      },fail(res){
        console.log("detail获取失败",res)
      }
    })
  },
    //获取标题
  getTitle(e){
    Title = e.detail.value
  },
    //获取笔记内容
  getText(e){
    Text = e.detail.value
  },
    //预览图片
  preImg(){
    console.log("here is preImg")
    console.log("Img:",Img)
    wx.previewImage({
      urls: [Img], 
      current: Img, 
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })
  },
    //上传图片
  getImg(){
    wx.cloud.init({
      traceUser: true,
    })
    let that = this;
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
                  console.log("imgUrl:",imgUrl)
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
    //更新笔记
  finish(){
    if(Title.length==0){
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
              title:"",
              text:""
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
                let OOP = {}
                OOP.title = Title
                OOP.text = Text
                OOP.image = Img
                OOP.ispin = false
                OOP.time = DuiXiang.time
                wx.showLoading({
                  title: '更新中。。。',
                })
                let i = 0
                for(;i<NOTE.length;i++){
                  if(NOTE[i].title === Title){
                    break;
                  }
                }
                for(let j=i;j<NOTE.length;j++){
                  NOTE[j] = NOTE[j+1]
                }
                NOTE.length--
                 NOTE[NOTE.length] = OOP
                 DB.doc(id).update({
                   data:{
                     notes: NOTE
                   },success(res){
                     wx.hideLoading()
                     console.log("更新成功",res)
                     wx.showToast({
                       title: '笔记更新成功',
                     })
                     let timeOut = setTimeout(function(){
                       wx.redirectTo({
                        url: '../mytext/mytext?id='+OPID,      //OPID传入
                       })
                     })
                 },fail(res){
                   console.log("修改数据失败",res)
                   wx.hideLoading()
                   wx.showToast({
                     title: '更新失败',
                     icon:"none"
                   })
                 }
               })
               },fail(res){
                 console.log("获取数据失败",res)
                 wx.showToast({
                   title: '更新失败',
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
  },
    //删除
  delete(){
    wx.showLoading({
      title: '删除中。。。',
    })
    let i = 0
    for(;i<NOTE.length;i++){
      if(NOTE[i].title === Title){
        break;
      }
    }
    for(let j=i;j<NOTE.length;j++){
      NOTE[j] = NOTE[j+1]
    }
    NOTE.length--
    DB.doc(ID).update({
      data:{
        notes:NOTE
      },success(res){
        console.log("删除成功",res)
        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
        })
        let timeOut = setTimeout(function(){
          wx.redirectTo({
            url: '../mytext/mytext?id='+OPID,      //OPID传入
          })
        })
      },fail(res){
        console.log("删除失败",res)
        wx.hideLoading()
        wx.showToast({
          title: '删除失败',
          icon:'none'
        })
      }
    })
  },
    //置顶
  pin(){
    let that = this
    IsPin = !IsPin
    wx.showLoading({
      title: '置顶修改中。。。',
    })
    let i = 0
    for(;i<NOTE.length;i++){
      if(NOTE[i].title === Title){
        NOTE[i].ispin = !NOTE[i].ispin
      }
    }
    DB.doc(ID).update({
      data:{
        notes:NOTE
      },success(res){
        console.log("置顶成功",res)
        if(IsPin){
          that.setData({
            ispin:"../../images/ispin.png"
          })
        }else{
          that.setData({
            ispin:"../../images/notpin.png"
          })
        }
        wx.hideLoading()
        wx.showToast({
          title: '置顶修改成功',
        })
        let timeOut = setTimeout(function(){
          wx.redirectTo({
            url: '../mytext/mytext?id='+OPID,      //OPID传入
          })
        })
      },fail(res){
        console.log("置顶修改失败",res)
        wx.hideLoading()
        wx.showToast({
          title: '删除失败',
          icon:'none'
        })
      }
    })
  }
})