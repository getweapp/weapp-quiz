const https = require('../../public/js/douban.js');

if(!Object.assign) {
  Object.assign = require('../../public/core/object-assign.js')
}


//获取应用实例
var app = getApp();
Page({
  data: {
    isLoading:false,
    subject:'kemu1',
    column:[{},{},{class:'num'}]
  },
  onLoad (params) {
    this.data.subject = params.subject;
    this.data.type = params.type;
    var that = this;
    https.classify('weixin/small/1.0?m=SmallApp&c=weixin&a=special',{subject:params.subject,type:params.type}).then((data) =>{
      if(data.data.status == 1){
        data = data.data.data;
        this.data.column[0].option = data[0];
        this.data.column[1].option = data[1];
        this.data.column[2].option = data[2];
        this.data.isLoading = true;
        that.setData(that.data);
      }
    })
     this.setData(this.data);     
  },
  onUnload(){//页面卸载

  }
});