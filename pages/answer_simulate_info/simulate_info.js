const https = require('../../public/js/douban.js');

if(!Object.assign) {
  Object.assign = require('../../public/core/object-assign.js')
}
//index.js
//获取应用实例
var app = getApp();
Page({
  params:{

  },
  data: {
    hourLong:45*60,//答题时长，单位秒
    time:'45:00',//答题时长，单位秒
    maxError:10,//最大错题数
    userType:'xuechetiku',
    isShowNewExam:false,//是否显示后台答案统计
    isNewExam:false,//是否使用后台答案。为true时必须isShowNewExam也为true
    isLoading:false,//加载
    swiper:{
      active:0
    },
    layerlayer:{
      isLayerShow:false,//默认弹窗
      layerAnimation:{},//弹窗动画
    },
    answerUrl:'weixin/small/1.0?m=SmallApp&c=weixin&a=mnksHandPaper',//交卷URL
    answers:{
      onLoadUrl:'weixin/small/1.0?m=SmallApp&c=weixin&a=questionID',//题目号链接      
      start:0,//初始题号
      end:0,//结束题号
      allLists:[],//题号数据
      activeNum:0,//当前条数
      showActiveNum:0,//当前显示条数
      onceLoadLength:5,//一次向俩端加载条数
      url:'weixin/small/1.0?m=SmallApp&c=weixin&a=getQuestion',//题目详情链接
      isShowTip:false//默认是否显示提示
    }
  },
  //单选逻辑
  tapRadio:function(e){
    //判断是否为已答题
    if(this.data.answers.allLists[this.data.answers.activeNum].isNoFirst){
      return false;
    }
    var thisOption=e.currentTarget.dataset.option,
        list = this.data.answers.allLists[this.data.answers.activeNum].options.map(function(option,i){ 
          if(thisOption == option.tip){
            if(!option.isSelect){
              // option.isActive = true;
              option.isSelect = true;       
            }else{
              // option.isActive = false;
              option.isSelect = false;
            }
          }
          return option
        });      
    this.data.answers.allLists[this.data.answers.activeNum].options = list;
    this.tapSelect(e);
  },
  //多选逻辑
  tapCheckbox:function(e){
    //判断是否为已答题
    if(this.data.answers.allLists[this.data.answers.activeNum].isNoFirst){
      return false;
    }
    var thisOption=e.currentTarget.dataset.option,
        list = this.data.answers.allLists[this.data.answers.activeNum].options.map(function(option,i){ 
          if(thisOption == option.tip){
            if(!option.isSelect){
              // option.isActive = true;
              option.isSelect = true;       
            }else{
              // option.isActive = false;
              option.isSelect = false;
            }
          }
          return option
        });      
    this.data.answers.allLists[this.data.answers.activeNum].options = list;
    this.setSwiperList();
    this.setData(this.data);   
  },
  //答案判断逻辑
  tapSelect:function(e){
    //判断是否为已答题
    if(this.data.answers.allLists[this.data.answers.activeNum].isNoFirst){
      return false;
    }    
    
    var answered = 0,bool=true,that=this;
    this.data.answers.allLists[this.data.answers.activeNum].options.forEach(function(option,i){
      //解析答案数字编码
      if(option.isSelect){
        switch(option.tip){
          case 'A':
            answered = + 16;
          break;
          case 'B':
            answered = + 32;
          break;
          case 'C':
            answered = + 64;
          break;
          case 'D':
            answered = + 128;
          break;
          default:
          console.log('超出设定');
        }
      }
      if(option.isSelect && !option.correct){
        bool=false;
      }
      if(!option.isSelect && option.correct){
        bool=false;
      }
    });  
    //存放本次答案数字编码
    this.data.answers.allLists[this.data.answers.activeNum].answered = answered;
    
    //改变题目状态为已答
    if(bool){
      //修正答案统计
      if(this.data.answers.allLists[this.data.answers.activeNum].isAnswer == 0){
        this.data.answers.success++;
      }
      //修正答案统计
      if(this.data.answers.allLists[this.data.answers.activeNum].isAnswer == 2){
        this.data.answers.success++;
        this.data.answers.error--;
      }
      //设置为对题
      this.data.answers.allLists[this.data.answers.activeNum].isAnswer = 1;
    }else{
      //修正答案统计
      if(this.data.answers.allLists[this.data.answers.activeNum].isAnswer == 0){
        this.data.answers.error++;
      }
      //修正答案统计
      if(this.data.answers.allLists[this.data.answers.activeNum].isAnswer == 1){
        this.data.answers.success--;
        this.data.answers.error++;
      }
      //设置为错题
      this.data.answers.allLists[this.data.answers.activeNum].isAnswer = 2;      
    }
    //改变为已答题状态
    this.data.answers.allLists[this.data.answers.activeNum].isNoFirst = true;
    this.data.isShowTip = !bool;
    this.setSwiperList();
    this.setData(this.data);
    if(this.data.maxError+1 == this.data.answers.error){
      wx.showModal({
        title:'提示',
        content: `您已答错了${this.data.answers.error}题，成绩不合格，是否继续答题？` ,
        showCancel:true,
        cancelText:'继续答题',
        cancelColor:'#00bcd5',
        confirmText:'交卷',
        confirmColor:'#00bcd5',
        success: function(res) {
          if (res.confirm) {
            that.setSubmit();
          }else{
            if(that.data.answers.activeNum + 1 < that.data.answers.allLists.length){
              setTimeout(() => that.onSwiper('left'),200);
            }
          }
        }
      });
    }else if(that.data.answers.activeNum + 1 < that.data.answers.allLists.length){
      setTimeout(() => that.onSwiper('left'),200);
    }
    if(this.data.answers.activeNum + 1 == that.data.answers.allLists.length){
      this.submitTip();
    }
  },
  //页码切换列表效果
  pageClick:function(){
    var layerAnimation = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 500,
          timingFunction: "ease",
          delay: 0
        });
    if(!this.data.layerlayer.isLayerShow){ 
      layerAnimation.translate3d(0,0,0).step();
    }else{
      layerAnimation.translate3d(0,'100%',0).step();
    }
    this.data.layerlayer.isLayerShow = !this.data.layerlayer.isLayerShow;
    this.data.layerlayer.layerAnimation =  layerAnimation; 
    this.setData(this.data);
  },
  //页码切换列表收缩
  layerFooterClick:function(){
    var layerAnimation = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 500,
          timingFunction: "ease",
          delay: 0
        });
    layerAnimation.translate3d(0,'100%',0).step();
    this.data.layerlayer.isLayerShow = false;
    this.data.layerlayer.layerAnimation =  layerAnimation; 
    this.setData(this.data);
  },
  //题号变更逻辑
  setActiveNum:function(e){
    var thisOption=e.currentTarget.dataset.option - 0;
    this.data.answers.activeNum = thisOption;
    this.data.answers.showActiveNum = thisOption;
    this.data.isLoading = false;  
    this.layerFooterClick();
    this.getSubject();
  },
  //swiper切换
  setEvent:function(e){
    this.data.swiper.touchstartEvent = e;
    return false;
  },
  //滑动结束
  touchEnd:function(e){
    this.onSwiper(this.getDirection(this.data.swiper.touchstartEvent,e));
    return false;
  },
  //swiper切换
  onSwiper:function(dire){
    var that = this,
        active = 0,
        storeSetTime,
        animationO = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 200,
          timingFunction: "linear",
          delay: 0
        }),
        animationT = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 200,
          timingFunction: "linear",
          delay: 0
        }),
        animationS = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 200,
          timingFunction: "linear",
          delay: 0
        });
    
    if(!this.$isLock){//锁屏控制

      this.$isLock = true;

      if(dire == 'bottom' || dire == 'top' || !dire){
        this.$isLock = false;
        return false;
      }

      if(this.data.answers.activeNum >= this.data.answers.allLists.length - 1 && dire == 'left'){
        this.$isLock = false;
        return false;
      }

      if(this.data.answers.activeNum <= 0 && dire == 'right'){
        this.$isLock = false;
        return false;
      }

      if(dire == 'right'){
        animationO.translate3d('0',0,0).step();
        animationT.translate3d('100%',0,0).step();
        if(this.data.answers.activeNum > this.data.answers.start){
          active = - 1;
        }else{
          this.$isLock = false;
          return;
        }
      }
      if(dire == 'left'){
        animationT.translate3d('-100%',0,0).step();
        animationS.translate3d('0',0,0).step();
        if(this.data.answers.activeNum < this.data.answers.end){
          active = 1;
        }else{
          this.$isLock = false;
          return;
        }
      }
      this.data.swiper.animationO = animationO.export();
      this.data.swiper.animationT = animationT.export();
      this.data.swiper.animationS = animationS.export();
      this.data.answers.showActiveNum = this.data.answers.activeNum + active;

      this.setData(this.data);
      
      setTimeout(function(){ 
        that.setHtmlsetHtml(active);
      },200);
    }
  },
  //修改页面至正常位置
  setHtmlsetHtml:function(active){
    var animationO = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 0,
          delay: 0
        }),
        animationT = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 0,
          delay: 0
        }),
        animationS = wx.createAnimation({
          transformOrigin: "50% 50%",
          duration: 0,
          delay: 0
        });     
      animationO.translate3d('-100%',0,0).step();
      animationT.translate3d('0',0,0).step();
      animationS.translate3d('100%',0,0).step();
      this.data.swiper.active = this.data.swiper.active + active;
      this.data.answers.activeNum = this.data.answers.activeNum + active;
      this.data.answers.showActiveNum = this.data.answers.activeNum;
      this.data.swiper.animationO = animationO;
      this.data.swiper.animationT = animationT;
      this.data.swiper.animationS = animationS;
      this.setSwiperList();
      this.setData(this.data);
      //调用加载数据方法
      if( (this.data.swiper.active == 2 && this.data.answers.start > 0) || (this.data.swiper.active+2 == this.data.answers.list.length && this.data.answers.end+1 < this.data.answers.allLists.length)){
        this.getSubject();
      }
      //调用滑动结束回调
      if(this.isLockCall && typeof this.isLockCall == 'function'){
        this.isLockCall();
        this.isLockCall = false;
      }
      this.$isLock = false;
  },
  //获得手势方向
  getDirection:function(startEvent,endEvent){
    var x = endEvent.changedTouches[0].clientX - startEvent.changedTouches[0].clientX,
        y = endEvent.changedTouches[0].clientY - startEvent.changedTouches[0].clientY,
        pi=360*Math.atan(y/x)/(2*Math.PI);
        if(pi<25 && pi>-25 && x>0 && Math.abs(x) > 10){
          return 'right';
        }
        if(pi<25 && pi>-25 && x<0 && Math.abs(x) > 10){
          return 'left';
        }
        if((pi<-75 || pi>750) && y>0 && Math.abs(y) > 10){
          return 'bottom';
        }
        if((pi<-75 || pi>75) && y<0 && Math.abs(y) > 10){
          return 'top';
        }
  },
  //切换题目逻辑
  getSubject:function(callBack){
    var that=this,start = this.data.answers.activeNum - this.data.answers.onceLoadLength,end = this.data.answers.activeNum + this.data.answers.onceLoadLength,params;
    start = start > 0 ? start : 0 ;
    end = end+1 >= this.data.answers.allLists.length ? this.data.answers.allLists.length : end ;
    //存放下次展示allallList数据
    params = this.data.answers.allLists.slice(start,end+1);
    //存放展示allallList数据ID
    params = params.map(function(data){
      //后台需要int型
      return data.id-0
    });
    https.find(this.data.answers.url,{questionID:params,subject:this.data.subject},{
      isNewExam:this.data.isShowNewExam && this.data.isNewExam
    })
    .then(d => {
        //注册滑动结束回调
        if(this.$isLock){
          this.isLockCall = ((d) => {
              return this.callBackGetSubject(d,start,end);
          })(d)
        }else{  
          this.callBackGetSubject(d,start,end);
        }
        if(typeof callBack == 'function'){
          callBack();
        }
    })
    .catch(e => {
      this.callBackError(e.message);
    })
  },
  //详情数据加载的回调
  callBackGetSubject:function(d,start,end){
      d.data.forEach((data,i) => {
        this.data.answers.allLists[start+ i] = Object.assign({},data,this.data.answers.allLists[start + i]);
      })
      this.data.answers.list = d.data;
      this.data.isLoading = true;  
      this.data.answers.list = d.data;   
      this.data.answers.start = start;
      this.data.answers.end = end;
      this.data.swiper.active = this.data.answers.activeNum-this.data.answers.start;  
      this.setSwiperList();
      this.setData(this.data);      
  },
  //错误的回调
  callBackError:function(e){
      wx.showModal({
        title: '错误',
        content: '错误提示是：'+ e ,
        showCancel:false,
        confirmText:'确认关闭',
        success: function(res) {
          // if (res.confirm) {
          //   console.log('用户点击确定')
          // }
        }
      })
  },
  //交卷
  submitTip:function(){
    const that = this;
    if(this.data.answers.allLists.length > this.data.answers.error + this.data.answers.success){
      wx.showModal({
        title:'提示',
        content: `您已经回答了${this.data.answers.error + this.data.answers.success}题，还有${this.data.answers.allLists.length - this.data.answers.error - this.data.answers.success}题未答，确定要交卷吗？` ,
        showCancel:true,
        cancelText:'继续答题',
        cancelColor:'#00bcd5',
        confirmText:'交卷',
        confirmColor:'#00bcd5',
        success: function(res) {
          if (res.confirm) {
            that.setSubmit();
          }
        }
      });
    }else{
      wx.showModal({
        title:'提示',
        content: '已经是最后一道题了了，交卷后可立即查看成绩',
        showCancel:false,
        confirmText:'知道了',
        confirmColor:'#00bcd5',
        success: function(res) {
          that.setSubmit();
        }
      })
    }
  },
  //提交函数
  setSubmit:function(){
    var record = this.data.answers.allLists.map((option,i) => {
      return {
        id:option.id,
        answer:option.isAnswer,
        choose:option.answered || 0
      };
    });
    https.setExamInfo(this.data.answerUrl,{
      subject:this.data.subject,
      type:this.data.type,record,
      subject:this.data.subject,
      useTime:this.params.seconds,
      city:app.globalData.getLocation
      },{}
    )
    .then((data) =>{
      if(data.data.status == 1){
        wx.redirectTo({
          url: `../../pages/answer_mark/mark?subject=${this.data.subject}&type=${this.data.type}&time=${this.params.seconds}&mark=${data.data.data.score}&mid=${data.data.data.mid}&error=${this.data.answers.error}`
        })
      }
    })
  },
  //计时
  setTime:function(){
    let that = this,seconds = Math.floor((new Date().getTime() - this.data.startTime)/1000),minutes = 0;
    this.params.seconds = seconds;
    if(seconds >= this.data.hourLong){
      this.params.seconds = this.data.hourLong;
      this.data.time = '00:00';
      this.setData(this.data);
      wx.showModal({
        title:'提示',
        content: '考试时间已到，交卷后可立即查看成绩',
        showCancel:false,
        confirmText:'知道了',
        confirmColor:'#00bcd5',
        success: function(res) {
          that.setSubmit();
        }
      })
    }else{
        seconds = this.data.hourLong - seconds;
        minutes = Math.floor(seconds/60);
        seconds = seconds%60;
        this.data.time = `${minutes > 9 ? minutes: '0' + minutes}:${seconds > 9 ? seconds: '0' +　seconds}`;
        this.setData(this.data);
        this.swiperTime = setTimeout(()=>{
        this.setTime();
        },1000);
    }
    
  },
  setSwiperList(){
      var oldStar = this.data.answers.activeNum-1,
          oldEnd = this.data.answers.activeNum+1,
          star = oldStar >= 0 ? oldStar : 0 ,
          end = oldEnd <= this.data.answers.allLists.length ? oldEnd : this.data.answers.allLists.length;
      this.data.swiper.list = this.data.answers.allLists.slice(star,end+1);    
      
      if(oldStar < 0 ){
        this.data.swiper.list.unshift({});
      }
      if(oldEnd > this.data.answers.allLists.length){
        this.data.swiper.list.push({});
      }
  },
  onLoad (params) {
    var that = this;
    this.data.subject = params.subject;
    this.data.type = params.type;
    if(params.subject == 'kemu3'){
      this.data.maxError = 5;
    }
    https.initialize(this.data.answers.onLoadUrl,{subject:params.subject,type:params.type},{
      isNewExam:this.data.isShowNewExam && this.data.isNewExam,
      isShowNewExam:this.data.isShowNewExam
    })
    .then(d => {
        this.data.answers.allLists = d.data;
        this.data.answers.success = d.success;
        this.data.answers.error = d.error;
        this.data.answers.loading = false;    
        this.setData(this.data);
        this.getSubject(() => {
          this.data.startTime = new Date().getTime();
          this.setTime();
        });
    })
    .catch(e => {
      this.callBackError(e.message);
      // this.setData({ subtitle: '获取数据异常', movies: [], loading: false })
      // console.error(e)
    });
  },
  onHide(){
    clearInterval(this.swiperTime);
  },
  onUnload(){//页面卸载
    clearInterval(this.swiperTime);
  }
});