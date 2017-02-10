const https = require('../../public/js/douban.js');

if(!Object.assign) {
  Object.assign = require('../../public/core/object-assign.js')
}

//获取应用实例
var app = getApp();
Page({
  data: {
    column:[{
      class:'num',
      option:[
        {
          "id": "3",
          "title": "安全ssss行车、文明驾驶基础知识",
          "count": "284"
        }
      ]
    }],
  },
  onLoad (params) {
    this.data.subject = params.subject;
    this.data.type = params.type;
    var that = this;
    https.chapter('weixin/small/1.0?m=SmallApp&c=weixin&a=chapter',{subject:params.subject,type:params.type}).then((data) =>{
      if(data.data.status == 1){
        that.data.subject = params.subject;
        that.data.column[0].option = data.data.data;
        that.setData(that.data);
      }
    })
     this.setData(this.data);   
  },
  onUnload(){//页面卸载

  }
});