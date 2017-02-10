//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
   subject:'kemu1',//题目类型
   score:'100',//得分
   passScore:90,//及格分数
   error:0,//模拟考错题数
   mid:null,//模拟考ID
   grades:'',//等级
   minutes:'45',
   seconds:'00'
  },
  gotoWDCT(){
    if(this.data.error > 0){
        wx.redirectTo({
          url: `../../pages/answer_info/info?subject=${this.data.subject}&type=wdct&mid=${this.data.mid}`
        })
    }else{
      wx.showModal({
        title:'提示',
        content: '恭喜您，暂无错题。即将返回首页！',
        showCancel:false,
        confirmText:'知道了',
        confirmColor:'#00bcd5',
        success: function(res) {
          wx.redirectTo({
            url: `../../pages/index/index`
          })
        }
      })
    }
  },
  onLoad (params) {
    var time = params.time,
        minutes = Math.floor(time/60),
        seconds = time%60,
        grades = params.mark;
    this.data.minutes =minutes > 9 ? minutes: '0' + minutes;
    this.data.seconds = seconds > 9 ? seconds: '0' +　seconds;
    this.data.subject = params.subject;
    this.data.score = grades;
    this.data.mid = params.mid;
    this.data.error = params.error;
    if(grades >=　this.data.passScore){
      this.data.grades = 'active';
    }
    var that = this;
    
    app.getUserInfo(function(){
        that.data.hasUserInfo = true;
        that.data.userInfo = app.globalData.userInfo;
        that.setData(that.data)
    })
  },
  onShareAppMessage: function () {
    return {
      title: `我在“学车题库”题做得到${this.data.score}分，等你来挑战.....`,
      desc: '2017年考驾照最新学车题库，90%学员都在使用',
      path: '/pages/answer_mark/mark'
    }
  }
});