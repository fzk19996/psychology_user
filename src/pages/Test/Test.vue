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
      <!--单选题列表-->
      <template v-if="table_index==tableList.length">
        <section class="que" v-show="current_index_e==-1 && table_index==tableList.length">
            <span class="que_content">开始进行实验{{experiment.title}}</span>
        </section>
        <section class="que" v-for="(item, index) in experiment.questions" :key="item.question_id"
               v-show="index == current_index_e">
               <span class="que_content">{{index + 1}}.&nbsp;{{item.question}}[{{item.type}}]</span>
               <div>
                <img v-if="item.pic_url" :src="item.pic_url" :height="300" :width="600">
               </div>
               <template v-if="item.type=='奖励按键反应'||item.type=='惩罚按键反应'||item.type=='无反馈按键反应'">
                 <div class="fill_option">  
                  <mu-text-field v-model="fillAnswer" label="填写数字" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
                </div>
               </template>
               <template v-if="item.type=='根据要求说出词语'">
                 <div class="fill_option">
                  <mu-text-field v-model="fillAnswer" label="填写词语" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
                </div>
               </template>
               <template v-if="item.type=='朗读'">
                 <div class="fill_option">
                  朗读题目中的语句
                </div>
               </template>
               <template v-if="item.type=='看图回答问题'">
                 <div class="fill_option">
                  <mu-text-field v-model="fillAnswer" label="根据图片内容填写" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
                </div>
               </template>
               <template v-if="item.type=='根据提问回答问题'">
                 <div class="fill_option">
                  <mu-text-field v-model="fillAnswer" label="填写内容" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
                </div>
               </template>
               <template v-if="item.type=='记忆测验'">
                 <div class="fill_option">
                  <mu-text-field v-model="fillAnswer" label="填写数字" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
                </div>
               </template>
        </section>
        <template v-if="current_index_e==experiment.questions.length-1">
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
      </template>
      <template v-if="table_index<tableList.length">
      <section class="que" v-show="current_index_t==-1">
          <span class="que_content">开始进行量表{{tableList[table_index].title}}</span>
      </section>
      <section class="que" v-for="(item, index) in tableList[table_index].questions" :key="item.question_id"
               v-show="index == current_index_t">
        <div class="content">
          <span class="que_type">{{item.type}}</span>
          <span class="que_content">{{index + 1}}.&nbsp;{{item.question}}<span class="que_score"></span></span>
          <template v-if="item.type=='单选'">
            <div v-for="(option, optionIndex) in item.options"
                :key="'single'+ item.option_id + optionIndex">
              <div class="single_option">
              <mu-radio :value="optionIndex" v-model="singleAnswer" :label="optionIndex" v-if="option.content"  >
              </mu-radio>
              <!-- <span v-for="(pic_src, pic_index) in option.picList.split(';')" :key="pic_index" >
                  <img :src="pic_src" :height="200" :width="200" style="margin-left:50px">
              </span> -->
              </div>
            </div>
          </template>
          <template v-if="item.type=='多选'">
            <div class="multiple_option" v-for="(option, optionIndex) in item.options"
               :key="'multiple'+ item.option_id + optionIndex">
            <mu-checkbox :value="optionIndex" v-model="multipleAnswer" :label="option.content" style="margin-left:50px"
                        ></mu-checkbox>
            </div>
          </template>
          <template v-if="item.type=='填空'||item.type=='打分'">
                 <div class="fill_option">
                  <mu-text-field v-model="fillAnswer" label="填写词语" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
                </div>
          </template>
        </div>
      </section>
      </template>
      <!--上一题和下一题按钮-->
      <div class="paper_button">
        <!-- <mt-button type="primary" @click.native="prevQuestion"
                   :disabled="current_index < 1">{{current_index <  1 ? '无' :'上一题'}}
        </mt-button> -->
        <!-- <template v-if="table_index<tableList.length">
          <mt-button type="primary" @click.native="nextTableQuestion" v-if="current_index_t != tableList[table_index].questions.length-1">下一道题</mt-button>
          <mt-button type="primary" @click.native="nextTable" v-if="current_index_t==tableList[table_index].questions.length-1 && table_index<tableList.length-1">进入下一个量表
          </mt-button>
          <mt-button type="primary" @click.native="nextTable" v-if="current_index_t==tableList[table_index].questions.length-1 && table_index==tableList.length-1">进入到实验部分
          </mt-button>
        </template>
        <template v-if="table_index==tableList.length">
            <mt-button type="primary" @click.native="nextExperimentQuestion" v-if="current_index_e != experiment.questions.length-1">下一道题</mt-button>
            <mt-button type="primary" @click.native="clickSubmit" v-if="current_index_e==experiment.questions.length-1">提交测试
            </mt-button>
        </template> -->
      </div>

    </div>

   

  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import {Toast, MessageBox, Indicator} from 'mint-ui'
  import {getTableById, addAnswer, getTablesByIdList} from '../../api'
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

        table_answer_total_template:{
          table_title: '',
          expression: '',
          table_answers:[]
        },

        table_answer_template:{
          que_type: '',
          question: '',
          answer: '',
          score: 0
        },

        experiment_answer_template:{
          question: '',
          answer: '',
          time_use: 0,
          type:''
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
        test_id:'',
        testList:[],
        answer:[],
        current_index_e:-1,
        tableList:[],
        experiment:{},
        table_index:0,
        current_index_t:-1,
        timer:"",
        time_use:0,
        is_experiment:false,
        tableAnswer:[],
        experimentAnswer:[],
        video_url: '',
        videoFlag: false, //是否显示进度条
        videoUploadPercent: "", //进度条的进度，
        record_time_list:['奖励按键反应','惩罚按键反应','无反馈按键反应','根据要求说出词语','记忆测验'],
        start_question_time:0
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
      this.test_id = JSON.parse(this.$route.params.test_id)
      this.getTestInfo()
      document.onkeydown = function(e) {
            console.log('但是噶')
            //事件对象兼容
            let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
            //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
            //左
            if(e1 && e1.keyCode==49){
              console.log('按键1被按下')

            }

        }
    },
    /*mounted() {
      // 挂载完成后，判断浏览器是否支持popstate
      if(window.history && window.history.pushState) {
        // 进入页面时给history压入一个本地的连接
        window.history.pushState(null, null, document.URL);
        window.addEventListener('popstate', this.toBack, false);
      }
    },
    destroyed() {
      window.removeEventListener('popstate', this.toBack, false);
    },*/
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
        if(this.time_use>=this.experiment.questions[this.current_index_e].time_limit){
          this.time_use = 0
          this.nextExperimentQuestion()
        }else{
          this.time_use += 1
        }
      },


      nextTableQuestion(){
        if(this.current_index_t>=0){
          if(!this.setAnswer())
             return
        }
        this.current_index_t += 1
        console.log(this.table_index)
        console.log(this.current_index_t)
      },

      nextTable(){
        if(this.setAnswer()){
          console.log('被点击了')
          this.table_index += 1
          if(this.table_index>=this.tableList.length)
            this.is_experiment = true
        }
      },

      nextExperimentQuestion(){
        if(this.current_index_e>=0 && !this.setAnswer())
          return
        this.current_index_e += 1
        this.start_question_time = new Date().getTime()
        // if(this.current_index_e-1>=0){
        //   if(this.experiment.questions[this.current_index_e].type=='奖励按键反应'
        //       ||this.experiment.questions[this.current_index_e].type=='惩罚按键反应'
        //       ||this.experiment.questions[this.current_index_e].type=='无反馈按键反应'
        //       ||this.experiment.questions[this.current_index_e].type=='根据要求说出词语'
        //       ||this.experiment.questions[this.current_index_e].type=='记忆测验'){
        //   }
        // }
        if(this.experiment.questions[this.current_index_e].type=='奖励按键反应'
            ||this.experiment.questions[this.current_index_e].type=='惩罚按键反应'
            ||this.experiment.questions[this.current_index_e].type=='无反馈按键反应'
            ||this.experiment.questions[this.current_index_e].type=='根据要求说出词语'){
            this.time_use = 0
            this.timer = setInterval(this.start_timer, 1000)
        }
      },


    async getTestInfo(){
      // console.log(this.testId)
      let result = await getTestById(qs.stringify({test_id:this.test_id}))
      if(result.status==200){
        this.tableList = result.data.tableList
        this.experiment = result.data.experiment
        for(var i=0;i<this.tableList.length;i++){
          this.tableAnswer.push(JSON.parse(JSON.stringify(this.table_answer_total_template)))
          console.log('add table_answer')
          for(var j=0;j<this.tableList[i].questions.length;j++){
            console.log('add table_answer_question  ')
            this.tableAnswer[i].table_answers.push(JSON.parse(JSON.stringify(this.table_answer_template)))
          }
        }
        console.log('questions')
        console.log(this.experiment.questions)
        for(var i=0;i<this.experiment.questions.length;i++){
          this.experimentAnswer.push(JSON.parse(JSON.stringify(this.experiment_answer_template)))
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
        // MessageBox.confirm('确定要提交试卷吗?').then(action => {
          let res = await addAnswer({
            'table_answer_list':this.tableAnswer,
            'experiment_answer_list':this.experimentAnswer,
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
        let result = await addAnswer({
          'table_answer_list':this.tableAnswer,
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
        if(this.is_experiment){
          if(this.experiment.questions[this.current_index_e].type=='奖励按键反应'
            ||this.experiment.questions[this.current_index_e].type=='惩罚按键反应'
            ||this.experiment.questions[this.current_index_e].type=='无反馈按键反应'
            ||this.experiment.questions[this.current_index_e].type=='根据要求说出词语'){
              clearInterval(this.timer)
              if(this.experiment.questions[this.current_index_e].type=='奖励按键反应' 
                && this.experiment.questions[this.current_index_e].right_answer === this.fillAnswer){
                  alert("回答正确")
              }else if(this.experiment.questions[this.current_index_e].type=='惩罚按键反应' 
                && this.experiment.questions[this.current_index_e].right_answer !== this.fillAnswer){
                  alert("回答错误")
              }
          }
          console.log("下一步")
          if(this.experiment.questions[this.current_index_e].type=='奖励按键反应'
            ||this.experiment.questions[this.current_index_e].type=='惩罚按键反应'
            ||this.experiment.questions[this.current_index_e].type=='无反馈按键反应'
            ||this.experiment.questions[this.current_index_e].type=='根据要求说出词语'
            ||this.experiment.questions[this.current_index_e].type=='记忆测验')
          {
             xperimentAnthis.eswer[this.current_index_e].time_use = new Date().getTime() - this.start_question_time
          }
          this.experimentAnswer[this.current_index_e].answer = this.fillAnswer
          this.experimentAnswer[this.current_index_e].question = this.experiment.questions[this.current_index_e].question
          this.experimentAnswer[this.current_index_e].type = this.experiment.questions[this.current_index_e].type
          this.fillAnswer = ''
        }else{
          if(this.current_index_t==0){
              this.tableAnswer[this.table_index].table_title = this.tableList[this.table_index].title
              this.tableAnswer[this.table_index].expression = this.tableList[this.table_index].expression
            }
          if(this.tableList[this.table_index].questions[this.current_index_t].type=='单选'){
            if(this.singleAnswer === ''){
              Toast({
                message: '还没有选中选项',
                duration: 2000
              })
              return false
            }
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].score = parseInt(this.tableList[this.table_index].questions[this.current_index_t].options[this.singleAnswer].score)
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].answer =this.tableList[this.table_index].questions[this.current_index_t].options[this.singleAnswer].content
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].que_type = '单选'
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].question = this.tableList[this.table_index].questions[this.current_index_t].question
            this.singleAnswer = ''
          }else if(this.tableList[this.table_index].questions[this.current_index_t].type=='多选'){
            if(this.multipleAnswer.length==0){
              Toast({
                message: '还没有选中选项',
                duration: 2000
              })
              return false
            }
            for(var index in this.multipleAnswer){
              this.tableAnswer[this.table_index].table_answers[this.current_index_t].answer += this.tableList[this.table_index].questions[this.current_index_t].options[this.singleAnswer].content + ';'
              this.tableAnswer[this.table_index].table_answers[this.current_index_t].score += parseInt(this.tableList[this.table_index].questions[this.current_index_t].options[index].score)
            }
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].que_type = '多选'
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].question = this.tableList[this.table_index].questions[this.current_index_t].question
            this.multipleAnswer = []
          }else if(this.tableList[this.table_index].questions[this.current_index_t].type=='填空'){
            if(this.fillAnswer.length==0){
              Toast({
                message: '还没有填写内容',
                duration: 2000
              })
              return false
            }
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].answer = this.fillAnswer
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].que_type = '填空'
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].question = this.tableList[this.table_index].questions[this.current_index_t].question
            this.fillAnswer = ''
          }else if(this.tableList[this.table_index].questions[this.current_index_t].type=='打分'){
            if(this.fillAnswer.length==0){
              Toast({
                message: '还没有填写内容',
                duration: 2000
              })
              return false
            }
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].answer = this.fillAnswer
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].que_type = '打分'
            this.tableAnswer[this.table_index].table_answers[this.current_index_t].question = this.tableList[this.table_index].questions[this.current_index_t].question
            this.fillAnswer = ''
          }
        }
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
