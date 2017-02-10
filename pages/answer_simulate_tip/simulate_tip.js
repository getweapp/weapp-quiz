//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
   subject:'kemu1',//题目类型
   type:'mnks'//题目类型
  },
  onLoad (params) {
    var that = this;
    this.data.subject = params.subject;
    this.data.type = params.type;
    app.getUserInfo(function(){
        that.data.hasUserInfo = true;
        that.data.userInfo = app.globalData.userInfo;
        that.setData(that.data)
    })
  }
});