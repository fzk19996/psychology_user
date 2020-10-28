<template>
  <section class="paper">
    <HeaderTop  class="paper_header">
      <a href="javascript:" slot="left" class="go_back" @click="toBack">
        <i class="iconfont iconfanhui"></i>
      </a>

      <!--答题卡点击区域-->
      <div class="header_message" slot="right" >
        <img src="../../common/imgs/answer-card2.png">
        <span>答题卡</span>
      </div>
    </HeaderTop>

    <!--考试日期和考试时长-->
    <div class="paper_sub_title_first">
      <!-- <span class="paper_date">考试日期：{{currentDate | date-format('YYYY-MM-DD')}}</span>
      <span class="paper_duration">考试时长：{{paperInfo.paperDuration/60}}分钟</span> -->
    </div>

    <!--时间提醒和当前题数-->
    <div class="paper_sub_title_second">
      <!-- <!-- <span class="paper_clock"><i class="iconfont iconjishiqi"></i>{{restTime}}</span> -->
      <span class="paper_statistics" v-if="questionIndex<total_cnt"><i class="iconfont icontongji"></i>题目个数：{{questionIndex+1}}/{{total_cnt}}</span>
    </div>

    <!--考卷进度条提醒-->
    <div>
      <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"></el-progress>
    </div>

    <!-- 缓存路由组件对象 -->
    <!--    <keep-alive>
          <router-view></router-view>
        </keep-alive>-->

    <!--试卷问题及选项区域-->
    <div class="paper_container">
      <section class="que" v-if="questionIndex<total_cnt">
        <span>{{questionVO.type}}</span>
        <div class="content">
          <span class="que_content" ><template v-if="questionVO.type!=='指导语'&&questionVO.type!=='注视点'">{{questionIndex+1}}</template>.&nbsp;{{questionVO.question}}</span>
          <template v-if="questionVO.type==='注视点'||questionVO.type=='指导语'||questionVO.type.indexOf('按键反应'>=0)||questionVO.type=='看图回答问题'||questionVO.type=='根据要求说出词语'">
              <img v-if="questionVO.picUrl!==''" :src="questionVO.picUrl" height="600" width="1200"></img>
          </template>
        </div>
      </section>
      <!--上一题和下一题按钮-->
      <div class="paper_button">
          <template v-if="questionIndex>=total_cnt">
            <mt-button type="primary" @click.native="clickSubmit" >提交测试</mt-button>
            <el-upload
                class="upload"
                action="/api/video/upload"
                :show-file-list="true"
                :on-success="handleVideoSuccess"
                :before-upload="beforeUploadVideo"
                :on-progress="uploadVideoProcess"
                :file-list="videoList"
            >
            <li>上传录音</li>
        </el-upload>
          </template>
      </div>

    </div>
    <el-dialog title="修改用户信息" :visible.sync="errorDialog">
      <div style="color:red">按键错误</div>
    </el-dialog>
    <el-dialog title="修改用户信息" :visible.sync="rightDialog">
      <div style="color:blue">按键正确</div>
    </el-dialog>

   

  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import {Toast, MessageBox, Indicator} from 'mint-ui'
  import {submitAnswer, addAnswer, continueExam, queryExamQuestion, queryRedisAnswerVO} from '../../api'
  import {getNumberPrefix} from '../../utils/common.js'
  import {mapState, mapActions, mapGetters} from 'vuex'
  import qs from 'qs'
  import Recorder from 'js-audio-recorder'

  export default {
    name: "",
    data() {
      return {
        answer_template:{
          question_id: '',
          answer:'',
          score:'',
          que_type:'',
          time_use:'',
          correct:'',
          type:'',
          index:'',
          start:'',
          end:''
        },
        questionVO:{},
        questionIndex:0,
        total_cnt:0,
        errorDialog:false,
        rightDialog:false,
        key_effect:true,
        fillAnswer:'',
        record_start:0,
        record_end:0,
        timer:'',
        start_question_time:0,
        time_use:0,
        videoList:'',
        recorder:'',
        percentage:0

      }
    },
    computed:{
      ...mapState([
        'currentIndex',//当前题数
        'singleAnswers',
        'multipleAnswers',
        'judgeAnswers',
        'fillAnswers',
        'firstCurrentTime',
        'refresh_experiment_index'
      ]),
      ...mapGetters(['completeNumber'])
    },

    async created() {
      // Indicator.open({
      //   text: '加载中...',
      //   spinnerType: 'fading-circle'
      // });
      let mode = this.$route.params.mode
      if(mode==undefined||mode=='continue'){
        let res = await continueExam()
        if(res.status==200){
          this.questionVO = res.data
          console.log(this.questionVO)
          this.questionIndex = this.questionVO.index
          this.record_start = (new Date()).getTime();
          this.start_question_time =  (new Date()).getTime();
          if(this.questionVO.timeLimit!=0){
            this.time_use=0
            this.timer = setInterval(this.start_timer, 1000)
          }
        }else{
          console.log("出现异常")
        }
      }else{
        this.queryExamQuestion()
      }
      let res = await queryRedisAnswerVO();
      if(res.status==200){
        this.total_cnt = res.data.tableQuestionVOList.length
      }else{
        console.log("出现异常")
      }
      var that = this;
      document.onkeydown = function(e) {
            if(that.key_effect==false){
              console.log('按键无效')
              return
            }
            //事件对象兼容
            let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
            //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
            //左
            var question_now = that.questionVO
            if(e1 && e1.keyCode==49+0){ //按键1
                if(question_now.type.indexOf('按键反应')>=0||question_now.type=='工作记忆模板'||question_now.type=='工作记忆模板2'){
                    that.fillAnswer = '1'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+1){ //按键2
                if(question_now.type.indexOf('按键反应')>=0||question_now.type=='工作记忆模板'||question_now.type=='工作记忆模板2'){
                    that.fillAnswer = '2'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+2){ //按键3
                if(question_now.type.indexOf('按键反应')>=0||question_now.type=='工作记忆模板2'){
                    that.fillAnswer = '3'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+3){ //按键4
                if(question_now.type.indexOf('按键反应')>=0||question_now.type=='工作记忆模板2'){
                    that.fillAnswer = '4'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+4){ //按键5
                if(question_now.type.indexOf('按键反应')>=0||question_now.type=='工作记忆模板2'){
                    that.fillAnswer = '5'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+5){ //按键6
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '6'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+6){ //按键7
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '7'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+7){ //按键8
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '8'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+8){ //按键9
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '9'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==13){
                if(question_now.type.indexOf('按键反应')<0&&question_now.type!='记忆测验'&&question_now.type!='根据要求说出词语'&&question_now.type!='注视点'&&question_now.type!='工作记忆模板'&&question_now.type!='工作记忆模板2'){
                    console.log('下一题')
                    that.nextQuestion()
                }
            }
        }
    },
    methods: {
      ...mapActions([
        'nextQue',//点击下一题
        'prevQue',//点击上一题
        'cardQue',//点击答题卡序号
        'recordFirstCurrentTime',//记录当前花费时间
        'recordSingleAnswers',//记录单选题答案到数组，第一个参数为数组下标，第二个参数为当前下标的值
        'recordMultipleAnswers',//记录多选题答案到数组，第一个参数为数组下标，第二个参数为当前下标的值
        'recordJudgeAnswers',//记录判断题答案到数组，第一个参数为数组下标，第二个参数为当前下标的值
        'recordFillAnswers',//记录填空题答案到数组，第一个参数为数组下标，第二个参数为当前下标的值
        'refreshCurrentIndex',
        'refreshSingleAnswers',
        'refreshMultipleAnswers',
        'refreshJudgeAnswers',
        'refreshFillAnswers',
        'refreshFirstCurrentTime',
      ]),

      start_timer(){
        if(this.time_use>=this.questionVO.timeLimit){
          this.time_use = 0
          this.nextQuestion()
        }else{
          this.time_use += 1
        }
      },

      nextQuestion(){
        if(this.questionIndex<this.total_cnt){
            this.setAnswer()
        }
      },

      nextQuestion2(){
        this.questionIndex += 1
        if(this.questionIndex<this.total_cnt){
          this.queryExamQuestion()
        }
        this.key_effect = true
      },


      //用户手动点击提交试卷按钮，弹出确认框
    async clickSubmit(){
        if(!this.setAnswer())
          return
        if(this.video_url===""){
          Toast({
              message: "还没有上传音频",
              duration: 2000
          });
          return
        }
        let res = await submitAnswer()
        if (res.status==200){
            //等待成绩计算完毕并插入数据库表
            Indicator.open({
              text: '已经成功提交答案请稍等...',
              spinnerType: 'double-bounce'
            });
            setTimeout(() => {
              Indicator.close();
              Toast({
                message:'提交成功，请查看成绩',
                duration: 1500
              });
              this.$router.replace('/profile')
            }, 2000)
          }
          else {
            Toast({
              message:'交卷失败',
              duration: 1500
            });
            // this.$router.replace('/profile')
          }
        },
 
      //点击返回按钮
      toBack() {
        MessageBox.confirm('系统将自动提交试卷，请确认是否离开考试?').then(action => {
          Toast({
            message: '结束考试',
            duration: 1500
          });
          this.$router.isBack = true;
          this.$router.replace('/profile')
        }, () => {
          //点击取消按钮操作
        })
      },

      sleep(ms){
        return new Promise((resolve)=>setTimeout(resolve,ms));
      },

      async submitAnswer(answer){
        let res = await addAnswer(JSON.stringify(answer))
        if(res.status==200)
          return true
        else
          return false
      },

      async queryExamQuestion(){
        let res =  await queryExamQuestion(qs.stringify({type:'experiment', index:this.questionIndex}))
        if(res.status==200){
          this.questionVO = res.data
          this.record_start = (new Date()).getTime();
          this.start_question_time =  (new Date()).getTime();
          if(this.questionVO.timeLimit!=0){
            this.time_use=0
            this.timer = setInterval(this.start_timer, 1000)
          }
        }else{
          alert('查询题目失败')
        }
      },

      async setAnswer(){
        this.key_effect = false
        var answer = JSON.parse(JSON.stringify(this.answer_template))
        answer.start = this.record_start
        answer.time_use = new Date().getTime() - this.start_question_time
        answer.end =  new Date().getTime()
        answer.type = 'experiment'
        if(this.questionVO.time_limit!=0){
            clearInterval(this.timer)
            console.log(this.fillAnswer)
            if(this.questionVO.type=='奖励按键反应' 
                && this.questionVO.right_answer === this.fillAnswer){
                    Toast({
                      message: "回答正确",
                      duration: 2000
                    });
                    let _this = this
                    setTimeout(function()  {
                      answer.answer = _this.fillAnswer
                      answer.question_id = this.questionVO.questionId
                      answer.que_type = this.questionVO.type
                      answer.correct = 1
                      answer.index = this.questionIndex
                      if(_this.submitAnswer(answer))
                        _this.nextQuestion2()
                      else
                        console.log("提交答案失败")
                    }, 2000);
                    return
            }
            else if(this.questionVO.type=='惩罚按键反应' 
                && this.questionVO.right_answer !== this.fillAnswer){
                  Toast({
                      message: "回答错误",
                      duration: 2000
                  });
                  let _this = this
                    setTimeout(function()  {
                      answer.answer = _this.fillAnswer
                      answer.question_id = this.questionVO.questionId
                      answer.que_type = this.questionVO.type
                      answer.correct = 0
                      answer.index = this.questionIndex
                       if(_this.submitAnswer(answer))
                        _this.nextQuestion2()
                      else
                        console.log("提交答案失败")
                    }, 2000);
                    return 
            }
            if(this.questionVO.type.indexOf('按键反应')>=0){
                if(this.questionVO.right_answer!==this.fillAnswer){
                    answer.correct = 0
                }else{
                    answer.correct = 1
                }
            }
        }
        if(this.questionVO.type.indexOf('工作记忆模板')>=0){
          if(this.questionVO.right_answer!==this.fillAnswer){
            answer.correct = 0
          }else{
            answer.correct = 1 
          }
          answer.time_use = new Date().getTime() - this.start_question_time
        }
        answer.answer = this.fillAnswer
        answer.question_id = this.questionVO.questionId
        answer.que_type = this.questionVO.type
        answer.index = this.questionIndex
         if(this.submitAnswer(answer))
              this.nextQuestion2()
         else
              console.log("提交答案失败")
      },

      sleep(numberMillis) { 
        var now = new Date(); 
        var exitTime = now.getTime() + numberMillis; 
        while (true) { 
          now = new Date(); 
          if (now.getTime() > exitTime) 
            return; 
        } 
      },

      beforeUploadVideo (file) {
        const isLt1000M = file.size / 1024 / 1024 < 1000;
        if (!/\.(wav|m4a|mp4)$/.test(file.name)) { //'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb'
          this.$message.error('请上传正确的音频格式');
          return false;
        }
        if (!isLt1000M) {
          this.$message.error('上传视频大小不能超过1000MB哦!');
          return false;
        }
        this.isShowUploadVideo = false;
      },
      //进度条
      uploadVideoProcess (event, file, fileList) {
        this.videoFlag = true;
        this.videoUploadPercent = file.percentage.toFixed(0) * 1;
      },

      //上传成功回调
      handleVideoSuccess (res, file) {
        this.isShowUploadVideo = true;
        this.videoFlag = false;
        this.videoUploadPercent = 0;
        console.log(res)
        if(res){
          this.video_url = res
        }
      },
      
    },
    components: {
      HeaderTop
    },
    watch:{
      currentIndex() {
        this.percentage = parseInt((this.questionIndex+1)/this.total_cnt*100);
      }
    }
  }
</script>

<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>
  @import "../../common/stylus/mixins.styl"
  .pic_option 
    margin-top 25px
    margin-bottom 25px
    .col
      float left
      width 12.5%
      border 10px solid #fff
  .paper
    width 100%
    height 800px
    background-color #f5f5f5
    padding-top 45px
    .paper_header
      background-color lightslategrey
      .go_back
        width 40px
      .header_message
        display flex
        flex-direction column
        justify-content center
        align-items center
        > img
          border-radius 2px
          height 24px
          width 24px
        > span
          font-size 12px
    .paper_sub_title_first
      width 100%
      height 35px
      display flex
      justify-content space-between
      align-items center
      background-color #4ab8a1
      font-size 13px
      > span
        display inline-block
        color #f5f5f5
      .paper_date
        padding-left 15px
      .paper_duration
        padding-right 15px
    .paper_sub_title_second
      width 100%
      height 35px
      display flex
      justify-content space-between
      align-items center
      background-color rgba(0, 0, 0, .1)
      > span
        display inline-block
        color lightcoral
      .paper_clock
        padding-left 15px
        .iconjishiqi
          padding-right 10px
      .paper_statistics
        padding-right 15px
        .icontongji
          padding-right 10px
    .paper_container
      width 90%
      margin 15px auto
      margin-bottom 15px
      background-color #f5f5f5
      .que
        .content
          height 24px
          line-height 24px
          > span
            display block
          .que_type, .que_score
            color #4ab8a1
          .que_content
            padding-bottom 10px
        .single_option,.multiple_option,.judge_option,.fill_option
          margin-top 25px
          margin-bottom 25px
      .paper_button
        position fixed
        z-index 100
        left 0
        right 0
        bottom 0
        width 100%
        display flex
        justify-content space-evenly
        .mint-button
          width 40%
          background-color #4ab8a1
    .paper_card
      background-color #f5f5f5
      padding-bottom 50px
      .card_title
        width 100%
        height 35px
        display flex
        justify-content space-between
        align-items center
        font-size 16px
        color #fff
        background-color #778899
        > span:nth-child(1)
          padding-left 15px
        > span:nth-child(2)
          padding-right 15px
      .card_options
        .options
          .options_title
            padding-left 15px
            color #4ab8a1
          .row
            display flex
            align-items center
            width 100%
            flex-wrap wrap
            margin-top 6px
            .item
              display flex
              justify-content center
              align-items center
              width 20%
              padding-top 10px
              padding-bottom 10px
              > div
                display flex
                justify-content center
                align-items center
                width 24px
                height 24px
                border 1px solid #778899
                border-radius 12px
                color #778899
              .complete_flag
                border 1px solid #4ab8a1
                background-color #4ab8a1
                color #fff
      .card_button
        .mint-button
          width 80%
          position fixed
          z-index 100
          left 10%
          right 0
          bottom 0
          background-color #4ab8a1
</style>
<style lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  .mu-radio-wrapper
    align-items normal
    .mu-radio-ripple-wrapper
      position static
    .mu-radio-label
      white-space normal
      word-break break-all
      word-wrap break-word

  .mu-checkbox-wrapper
    align-items normal
    .mu-checkbox-ripple-wrapper
      position static
    .mu-checkbox-label
      white-space normal
      word-break break-all
      word-wrap break-word
</style>
