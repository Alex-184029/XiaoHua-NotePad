Page({
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
    }
})