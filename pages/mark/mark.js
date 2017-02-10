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
      highest:98,//题目总数
      collection:22,//收藏题数
      answerError:32,//答错题数
    },
    {
      subjectHeader:'科目四题库',
      subject:'kemu3',//题目类型
      titleTota:1311,//题目总数
      highest:98,//题目总数
      collection:22,//收藏题数
      answerError:32,//答错题数
    }
    ]
  },
  tapInletsMk(e){
    var subject = e.currentTarget.dataset.urlparem;
    app.getUserInfo(function(info){
      if(!!info){
        wx.navigateTo({
          url: `../../pages/answer_simulate_tip/simulate_tip?subject=${subject}`
        })
      }else{

      }
    });
  },
  onLoad(){
  },
  onShow(){
  }
});