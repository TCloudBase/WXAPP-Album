const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  let msg = null;
  
  try{
    msg = await cloud.openapi.security.msgSecCheck({
      content:event.text
    })
  }catch(e){
    msg = e
  }
  return msg;
}