//app.js
const https = require('../../public/js/douban.js');

if(!Object.assign) {
  Object.assign = require('public/core/object-assign.js')
}

//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    swiper:{
        imgUrls:[
          'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
          'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
          'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000
    },
    examInlets:[{
      subjectHeader:'科目一题库',
      subject:'kemu1',//题目类型
      titleTota:1311,//题目总数
      highest:0,//题目总数
      collection:0,//收藏题数
      answerError:0,//答错题数
    },
    {
      subjectHeader:'科目四题库',
      subject:'kemu3',//题目类型
      titleTota:1311,//题目总数
      highest:0,//题目总数
      collection:0,//收藏题数
      answerError:0,//答错题数
    }
    ]
  },
  tapInletsMk(e){
    var subject = e.currentTarget.dataset.urlparem;
    // if(!app.globalData.hasLogin){
    //     wx.showModal({
    //       title:'提示',
    //       content: '您未登录，无法看到收藏',
    //       showCancel:true,
    //       cancelText:'知道了',
    //       cancelColor:'#00bcd5',
    //       confirmText:'去登录',
    //       confirmColor:'#00bcd5',
    //       success: function(res) {
            
    //       }
    //     })
    //   }else{
        wx.navigateTo({
          url: `../../pages/answer_simulate_tip/simulate_tip?subject=${subject}&type=mnks`
        })
      // }
  },
  tapInletsSC:function(e){
    var that = this,
        subject = e.currentTarget.dataset.urlparem,
        collection = e.currentTarget.dataset.collection - 0;
    if(!!collection){
      wx.navigateTo({
        url: `../../pages/answer_info/info?subject=${subject}&type=wdsc`
      })
    }else{
      if(!app.globalData.hasLogin){
        wx.showModal({
          title:'提示',
          content: '您未登录，无法看到收藏',
          showCancel:true,
          cancelText:'知道了',
          cancelColor:'#00bcd5',
          confirmText:'去登录',
          confirmColor:'#00bcd5',
          success: function(res) {
            
          }
        })
      }else{
         wx.showModal({
          title:'提示',
          content: '未发现您的收藏',
          showCancel:false,
          confirmText:'知道了',
          confirmColor:'#00bcd5',
          success: function(res) {
            
          }
        })
      }
    }
  },
  tapInletsCT:function(e){
    var subject = e.currentTarget.dataset.urlparem,
        answerError = e.currentTarget.dataset.answererror - 0;
    if(!!answerError){
      wx.navigateTo({
        url: `../../pages/answer_info/info?subject=${subject}&type=wdct`
      })
    }else{
      if(!app.globalData.hasLogin){
        wx.showModal({
          title:'提示',
          content: '您未登录，无法看到错题',
          showCancel:true,
          cancelText:'知道了',
          cancelColor:'#00bcd5',
          confirmText:'去登录',
          confirmColor:'#00bcd5',
          success: function(res) {
            
          }
        })
      }else{
         wx.showModal({
          title:'提示',
          content: '恭喜您，暂无错题。',
          showCancel:false,
          confirmText:'知道了',
          confirmColor:'#00bcd5',
          success: function(res) {
            
          }
        })
      }
    }
  },
  onLoad(){
    var that= this;
    app.getUserInfo(function(){
      https.index('weixin/small/1.0?m=SmallApp&c=weixin&a=homepage').then((data) =>{
        if(data.data.status == 1){
          that.data.examInlets = data.data.data.examInlets
          that.data.swiper.imgUrls = data.data.data.imgUrls;
          that.setData(that.data);
        }
      })
    });
  },
  onShow(){
    this.onLoad();
  }
});