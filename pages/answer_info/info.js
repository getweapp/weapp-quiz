const https = require('../../public/js/douban.js');

if(!Object.assign) {
  Object.assign = require('../../public/core/object-assign.js')
}
//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    userType:'xuechetiku',
    mid:null,//模拟考ID
    isShowNewExam:true,//是否显示后台答案统计
    isNewExam:false,//是否使用后台答案。为true时必须isShowNewExam也为true
    isLoading:false,//加载
    swiper:{
      active:0
    },
    layerlayer:{
      isLayerShow:false,//默认弹窗
      layerAnimation:{},//弹窗动画
    },
    storeUrl:'weixin/small/1.0?m=SmallApp&c=weixin&a=collection',//收藏URL
    answerUrl:'weixin/small/1.0?m=SmallApp&c=weixin&a=submitAnswer',//提交答案URL
    answers:{
      isShowRemove:false,//是否显示移除按钮
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
    
    var answered = 0,bool=true;
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
    //延迟加载滑动
    if(this.data.answers.activeNum + 1 < this.data.answers.allLists.length){
      setTimeout(() => this.onSwiper('left'),200);
    }
    //传答案
    https.setAnswer(this.data.answerUrl,{
      questionID:this.data.answers.allLists[this.data.answers.activeNum].id,
      answer:this.data.answers.allLists[this.data.answers.activeNum].isAnswer,
      choose:this.data.answers.allLists[this.data.answers.activeNum].answered,
      subject:this.data.subject
    })
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
  //移除错题逻辑
  setRemoveList:function(e){
    var isStore = 0 ;
    //传答案
    https.setAnswer(this.data.answerUrl,{
      questionID:this.data.answers.allLists[this.data.answers.activeNum].id,
      answer:1,//改变为对题
      choose:this.data.answers.allLists[this.data.answers.activeNum].correctAnswerNum,//改变为正确答案
      subject:this.data.subject
    }).then((data) =>{
      this.initAnswer(() => {
        if(this.data.answers.allLists.length < 1){
          wx.showModal({
            tip:'提示',
            content: '恭喜您已经没有错题了，即将返回首页' ,
            showCancel:false,
            confirmText:'知道了',
            success: function(res) {
              wx.navigateBack(1)
            }
          })
        }
      });
    })
  },
  //收藏逻辑
  collectList:function(){
    var isStore = 0 ;
    this.data.answers.allLists[this.data.answers.activeNum].isStore = !this.data.answers.allLists[this.data.answers.activeNum].isStore;
    this.setData( this.data);
    isStore = this.data.answers.allLists[this.data.answers.activeNum].isStore? 1 : 0 ;
    https.setStore(this.data.storeUrl,{
      userType:'xuechetiku',
      questionID:this.data.answers.allLists[this.data.answers.activeNum].id,
      collection:isStore,
      subject:this.data.subject
    }).then( data => {
      if(this.data.type == 'wdsc'){
        this.initAnswer(() => {
        if(this.data.answers.allLists.length < 1){
          wx.showModal({
            tip:'提示',
            content: '您已经没有收藏了，即将返回首页' ,
            showCancel:false,
            confirmText:'知道了',
            success: function(res) {
              wx.navigateBack(1)
            }
          })
        }
        });
        this.setData(this.data);
      }
    })
    .catch( e => {
      this.callBackError(e.message);
    });
  },
  //剔除当前选项操作
  initAnswer:function(callBack){
      this.data.isLoading = false; 
      this.setData(this.data);
      
      var list = this.data.answers.allLists.splice(this.data.answers.activeNum,1)[0];
      //改变对题错题数字
      if(list.isAnswer == 1){
        this.data.answers.success--;
      }else if(list.isAnswer == 2){
        this.data.answers.error--;
      }
      //改变显示位置
      if(this.data.answers.activeNum > this.data.answers.allLists.length - 1){
        this.data.answers.activeNum = this.data.answers.allLists.length - 1;
        this.data.answers.showActiveNum = this.data.answers.allLists.length - 1;
      }
      if(this.data.answers.activeNum < 0 ){
        this.data.answers.activeNum = 0;
        this.data.answers.showActiveNum = 0;
      }
      //改变显示位置

      this.getSubject(callBack);
      
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
      this.data.answers.activeNum = this.data.answers.activeNum + active;
      this.data.answers.showActiveNum = this.data.answers.activeNum;
      this.data.swiper.animationO = animationO;
      this.data.swiper.animationT = animationT;
      this.data.swiper.animationS = animationS;
      this.setSwiperList();
      this.setData(this.data);
      //调用加载数据方法
      if((this.data.answers.activeNum-this.data.answers.start == 2 && this.data.answers.start > 0) || (this.data.answers.activeNum+2 == this.data.answers.end && this.data.answers.end+1 < this.data.answers.allLists.length)){
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
              typeof callBack == 'function' && callBack();
              return this.callBackGetSubject(d,start,end);
          })(d)
        }else{  
          typeof callBack == 'function' && callBack();
          this.callBackGetSubject(d,start,end);
        }
    })
    .catch(e => {
      this.callBackError(e.message);
    })
  },
  //详情数据加载的回调
  callBackGetSubject:function(d,start,end){
    var bool = true;
      d.data.forEach((data,i) => {
        if(!!this.data.answers.allLists[start+ i] && this.data.answers.allLists[start+ i].id == data.id){
          this.data.answers.allLists[start+ i] = Object.assign({},data,this.data.answers.allLists[start + i]);
        }else{
          bool = false;
        }
      })
      if(!bool){
        this.getSubject();
        return false;
      }
      this.data.answers.list = d.data;
      this.data.isLoading = true;  
      this.data.answers.list = d.data;   
      this.data.answers.start = start;
      this.data.answers.end = end;
      this.setSwiperList();
      this.setData(this.data);      
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
  onLoad (params) {
      this.data.subject = params.subject;//科目类别
      this.data.type = params.type;//科目类别
      this.data.mid = params.mid || null;//模拟考ID
      if(params.type == 'wdct' || params.type == 'wdsc'){//判断题型分析是否引用后台答案
        this.data.isShowNewExam = true;
        this.data.isNewExam = true;
      }else if(params.type == 'sjlx'){
        this.data.isShowNewExam = false;
      }
      https.initialize(this.data.answers.onLoadUrl,{
        subject:params.subject,
        type:params.type,
        chapterID:params.chapterID || null,
        mnksRecordID:this.data.mid
      },{
        isNewExam:this.data.isShowNewExam && this.data.isNewExam,
        isShowNewExam:this.data.isShowNewExam
      })
      .then(d => {
          if(params.type != 'wdct' && params.type != 'wdsc'){//判断题型分析是否改变初始位置
            this.data.answers.activeNum = d.activeNum || 0;
            this.data.answers.showActiveNum = d.activeNum || 0;
          }
          if(params.type == 'wdct'){
            this.data.answers.isShowRemove = true;
          }
          this.data.answers.allLists = d.data;
          this.data.answers.success = d.success;
          this.data.answers.error = d.error;
          this.data.answers.loading = false;    
          this.setData(this.data);
          this.getSubject();
      })
      .catch(e => {
        this.callBackError(e.message);
        // this.setData({ subtitle: '获取数据异常', movies: [], loading: false })
        // console.error(e)
      });
  },
  onUnload(){//页面卸载

  }
});