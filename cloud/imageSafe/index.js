// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
    //图片内容安全
    const res = await cloud.downloadFile({
      fileID: event.fileID,
    })
    const buffer = res.fileContent
    try {
      var result = await cloud.openapi.security.imgSecCheck({
        media: {
          contentType:"image/png",
          value: buffer
        }
      })
      return result
    } catch (err) {
      return err
    }
}