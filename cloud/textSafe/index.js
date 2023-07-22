// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
    //文本内容安全
  try {
    let result = await cloud.openapi.security.msgSecCheck({
      content: event.info
    })
    if (result.errCode == 0) {
      console.log('here',event.info)
      return true;
    }
    return false
  } catch (err) {
    return false;
  } 
}