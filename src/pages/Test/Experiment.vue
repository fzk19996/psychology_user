<template>
  <section class="paper">
    <HeaderTop :title="paperInfo.paperName" class="paper_header">
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
      <span class="paper_date">考试日期：{{currentDate | date-format('YYYY-MM-DD')}}</span>
      <span class="paper_duration">考试时长：{{paperInfo.paperDuration/60}}分钟</span>
    </div>

    <!--时间提醒和当前题数-->
    <div class="paper_sub_title_second">
      <span class="paper_clock"><i class="iconfont iconjishiqi"></i>{{restTime}}</span>
      <span class="paper_statistics"><i class="iconfont icontongji"></i>{{currentIndex + 1}}/{{queNumInfo.totalNum}}</span>
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
    <div class="paper_container" v-show="showPaperContainer">
      <section class="que" v-for="(item, index) in experimentData.questions" :key="index"
               v-show="index == current_index">
        <div class="content">
          <span class="que_content" ><template v-if="item.type!=='指导语'&&item.type!=='注视点'">{{question_index}}</template>.&nbsp;[{{item.type}}]{{item.question}}</span>
          <template v-if="item.type==='注视点'||item.type=='指导语'||item.type.indexOf('按键反应'>=0)||item.type=='看图回答问题'||item.type=='根据要求说出词语'">
              <img v-if="item.pic_url!==''" :src="item.pic_url" height="600" width="1200"></img>
          </template>
        </div>
      </section>
      <!--上一题和下一题按钮-->
      <div class="paper_button">
          <template v-if="current_index===experimentData.questions.length-1">
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

   

  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import {Toast, MessageBox, Indicator} from 'mint-ui'
  import {getExperimentById, addAnswer} from '../../api'
  import {getNumberPrefix} from '../../utils/common.js'
  import {mapState, mapActions, mapGetters} from 'vuex'
  import qs from 'qs'

  export default {
    name: "",
    data() {
      return {
        //当前日期
        currentDate: new Date(),
        //试卷信息
        paperInfo: {},
        //试卷问题类型数量
        queNumInfo: {},

        table_answer:[],
        
        answer:{
            answer_list:[],
            current_index:0,
            experiment_id:''
        },

        answer_template:{
          question_id: '',
          answer: '',
          time_use:'',
          correct: ''
        },

        //初始化时间戳
        currentTime: new Date().getTime(),
        restTime: "",
        timer: "",
        //单选题数组
        singleQueList: [],
        //单选题答案
        singleAnswer: '',

        //多选题数组
        multipleQueList: [],
        //多选题答案
        multipleAnswer: [],

        //判断题数组
        judgeQueList: [],
        //判断题答案
        judgeAnswer: '',

        //填空题数组
        fillQueList: [],
        //填空题答案
        fillAnswer: '',
        //是否显示paperContainer,默认进入页面为true
        showPaperContainer: true,
        //是否显示paperCard答题卡，默认进入页面为false，当点击答题卡区域为true
        showPaperCard: false,
        timeUsed:0, //考试花费时间
        percentage:0, //进度条值
        experiment:{},
        timer:"",
        time_use:0,
        is_experiment:false,
        tableAnswer:[],
        experimentAnswer:[],
        video_url: '',
        videoFlag: false, //是否显示进度条
        videoUploadPercent: "", //进度条的进度，
        start_question_time:0,
        current_index:0,
        experiment_id:'',
        experimentData:{},
        question_index:1
      }
    },
    computed:{
      ...mapState([
        'currentIndex',//当前题数
        'singleAnswers',
        'multipleAnswers',
        'judgeAnswers',
        'fillAnswers',
        'firstCurrentTime'
      ]),
      ...mapGetters(['completeNumber'])
    },

    created() {
      // Indicator.open({
      //   text: '加载中...',
      //   spinnerType: 'fading-circle'
      // });
      this.experiment_id = this.$route.params.experiment_id
      this.getExperimentInfo(this.experiment_id)
      var that = this;
      document.onkeydown = function(e) {
            //事件对象兼容
            let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
            //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
            //左
            if(e1 && e1.keyCode==49+0){ //按键1
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0||question_now.type=='工作记忆模板'){
                    that.fillAnswer = '1'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+1){ //按键2
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0||question_now.type=='工作记忆模板'){
                    that.fillAnswer = '2'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+2){ //按键3
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '3'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+3){ //按键4
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '4'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+4){ //按键5
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '5'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+5){ //按键6
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '6'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+6){ //按键7
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '7'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+7){ //按键8
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '8'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==49+8){ //按键9
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')>=0){
                    that.fillAnswer = '0'
                    that.nextQuestion()
                }
            }
            else if(e1 && e1.keyCode==13){
                var question_now = that.experimentData.questions[that.current_index]
                if(question_now.type.indexOf('按键反应')<0&&question_now.type!='记忆测验'&&question_now.type!='根据要求说出词语'&&question_now.type!='注视点'&&question_now.type!='工作记忆模板'){
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
        if(this.time_use>=this.experimentData.questions[this.current_index].time_limit){
          this.time_use = 0
          this.nextQuestion()
        }else{
          this.time_use += 1
        }
      },

      nextQuestion(){
        if(this.current_index<this.experimentData.questions.length-1){
            if(!this.setAnswer())
                return
            this.answer.current_index += 1
            sessionStorage.setItem('experiment_answer',JSON.stringify(this.answer))
            if(this.experimentData.questions[this.current_index].type!='指导语'||this.experimentData.questions[this.current_index].type!='注视点'){
                this.question_index += 1
            }
            this.current_index += 1
            this.start_question_time = new Date().getTime()
            // }
            if(this.experimentData.questions[this.current_index].time_limit!=0){
                this.time_use = 0
                this.timer = setInterval(this.start_timer, 1000)
            }
        }
      },


    async getExperimentInfo(experiment_id){
      // console.log(this.testId)
      let result = await getExperimentById({experiment_id:experiment_id})
      if(result.status==200){
        console.log('量表数据')
        this.experimentData = result.data
        for(var i=0;i<this.experimentData.questions.length;i++){
            this.answer.answer_list.push(JSON.parse(JSON.stringify(this.answer_template)))
        }
        this.start_question_time = new Date().getTime()
            // }
        if(this.experimentData.questions[this.current_index].time_limit!=0){
            this.time_use = 0
            this.timer = setInterval(this.start_timer, 1000)
        }
      }else{
        Toast({
            message: result.msg,
            duration: 2000
        });
        this.$router.replace('/profile')
      }
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
        let table_answer = JSON.parse(sessionStorage.getItem('table_answer'))
        let experiment_answer = JSON.parse(sessionStorage.getItem('experiment_answer'))
        experiment_answer.experiment_id = this.experiment_id
        // MessageBox.confirm('确定要提交试卷吗?').then(action => {
          let res = await addAnswer({
            'table_answer':table_answer,
            'experiment_answer':experiment_answer,
            'test_id': this.test_id,
            'video_url':this.video_url
          })
          console.log('提交试卷得到结果')
          console.log(res)
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
              this.$router.replace('/profile/');
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
      //最终提交答案，包含用户手动点击提交按钮和到时自动提交
      async handleSubmit() {
        let tableAnswer = JSON.parse(sessionStorage.getItem('table_answer'))
        let result = await addAnswer({
          'table_answer_list':tableAnswer,
          'experiment_answer_list':this.experimentAnswer,
          'test_id': this.test_id,
          'video_url':this.video_url
        })
        return result

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
      setAnswer(){
        if(this.experimentData.questions[this.current_index].time_limit!=0){
            clearInterval(this.timer)
            this.answer.answer_list[this.current_index].time_use = new Date().getTime() - this.start_question_time
            console.log(this.fillAnswer)
            if(this.experimentData.questions[this.current_index].type=='奖励按键反应' 
                && this.experimentData.questions[this.current_index].right_answer === this.fillAnswer){
                  this.$message.success('回答正确')
            }
            else if(this.experimentData.questions[this.current_index].type=='惩罚按键反应' 
                && this.experimentData.questions[this.current_index].right_answer !== this.fillAnswer){
                  this.$message.error('回答错误')
            }
            if(this.experimentData.questions[this.current_index].type.indexOf('按键反应')>=0){
                if(this.experimentData.questions[this.current_index].right_answer!==this.fillAnswer){
                    this.answer.answer_list[this.current_index].correct = 0
                }else{
                    this.answer.answer_list[this.current_index].correct = 1
                }
            }
        }
        this.answer.answer_list[this.current_index].answer = this.fillAnswer
        this.answer.answer_list[this.current_index].question_id = this.experimentData.questions[this.current_index].question_id
        return true
      },

      beforeUploadVideo (file) {
        const isLt1000M = file.size / 1024 / 1024 < 1000;
        if (['video/mp4'].indexOf(file.type) == -1) { //'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb'
          this.$message.error('请上传正确的视频格式');
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
        this.percentage = parseInt((this.currentIndex+1)/this.queNumInfo.totalNum*100);
        sessionStorage.removeItem("currentIndex");
        sessionStorage.setItem("currentIndex",this.currentIndex)
      },
      singleAnswers() {
        sessionStorage.removeItem("singleAnswers");
        sessionStorage.setItem("singleAnswers",JSON.stringify(this.singleAnswers))
      },
      multipleAnswers:function () {
        sessionStorage.removeItem("multipleAnswers");
        sessionStorage.setItem("multipleAnswers",JSON.stringify(this.multipleAnswers))
      },
      judgeAnswers() {
        sessionStorage.removeItem("judgeAnswers");
        sessionStorage.setItem("judgeAnswers",JSON.stringify(this.judgeAnswers))
      },
      fillAnswers() {
        sessionStorage.removeItem("fillAnswers");
        sessionStorage.setItem("fillAnswers",JSON.stringify(this.fillAnswers))
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
