//app.js
const https = require('public/js/douban.js');

if(!Object.assign) {
  Object.assign = require('public/core/object-assign.js')
}

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('1217_logs') || false;
    if(logs){
      this.globalData = logs;
    }else{
      
    }
  },
  getUserInfo:function(cb){
    var that = this;
     wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.globalData.getLocation = `${res.latitude},${res.longitude}` //纬,经
      }
    })
    if(this.globalData.hasLogin){
      typeof cb == "function" && cb(this.globalData.userInfo);
    }else{
      //调用登录接口
      wx.login({
        success: function (data) {
          https.login('weixin/small/1.0?m=SmallApp&c=weixin&a=login',{code:data.code}).then((data) =>{
            if(!!(data.data.status - 0) ){
              that.globalData.openid = data.data.data;
              that.globalData.hasLogin = true;
              wx.getUserInfo({
                success: function (res) {
                  that.globalData.userInfo = res.userInfo;
                  wx.setStorageSync('1217_logs', that.globalData);//储存用户信息
                  typeof cb == "function" && cb(that.globalData.userInfo)
                }
              })
            }else{//登录失败

            }
          });
         
        },
        fail:function(){
          typeof cb == "function" && cb(false)
        }
      })
    }
  },
  globalData:{
    hasLogin:false,//是否登陆
    userInfo:null,//用户信息
    openid:null,//用户唯一标识
    city:null//用户唯一标识
  }
})