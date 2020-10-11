<template>
  <section class="paper">
    <HeaderTop :title="paperInfo.paperName" class="paper_header">
      <a href="javascript:" slot="left" class="go_back" @click="toBack">
        <i class="iconfont iconfanhui"></i>
      </a>

      <!--答题卡点击区域-->
      <div class="header_message" slot="right" @click="toPaperCard">
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
      <section class="que" v-for="(item, index) in testList" :key="item.question_id"
               v-show="index == current_index">
        <div class="content">
          <!-- <span class="que_type">(单选题)</span> -->
          <span class="que_content">{{index + 1}}.&nbsp;{{item.question}}<span class="que_score">[{{paperInfo.singleScore}}分]</span></span>
          <a v-for="(video_src, video_index) in item.videoList.split(';')" :key="video_index" :href="video_src" :download="video_index+'.mp4'" style="margin-left:50px">资料{{video_index}}</a>
          <img :src="item.pictureSrc" alt="" style="width: 100%" v-if="item.pictureSrc">
          <template v-if="item.type=='单选'">
            <div v-for="(option, optionIndex) in item.options"
                :key="'single'+ item.option_id + optionIndex">
              <!--            <mt-radio
                            v-model="singleAnswer"
                            :options="singleQueList[0].options">
                          </mt-radio>-->
              <!-- <div > -->
                <!-- <div v-for="(pic_src, pic_index) in option.picList.split(';')" :key="pic_index" >
                    <img :src="pic_src" :height="200" :width="200">
                </div> -->
              <!-- </div> -->
              <div class="single_option">
              <mu-radio :value="option.option_id" v-model="singleAnswer" :label="option.content" v-if="option.content"  >
              </mu-radio>
              <span v-for="(pic_src, pic_index) in option.picList.split(';')" :key="pic_index" >
                  <img :src="pic_src" :height="200" :width="200" style="margin-left:50px">
              </span>
              </div>
            </div>
          </template>
          <template v-if="item.type=='多选'">
            <div class="multiple_option" v-for="(option, optionIndex) in item.options"
               :key="'multiple'+ item.option_id + optionIndex">
            <mu-checkbox :value="option.option_id" v-model="multipleAnswer" :label="option.content" style="margin-left:50px"
                        ></mu-checkbox>
            </div>
          </template>
          <template v-if="item.type=='问答'">
            <!-- <span class="que_type">(问答题)</span>
            <span class="que_content">{{item.content}}</span> -->

            <div class="fill_option">
              <mu-text-field v-model="fillAnswer" label="答题区域(答案不区分大小写，首尾空格忽略)" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
            </div>
          </template>
        </div>
      </section>
      <!--上一题和下一题按钮-->
      <div class="paper_button">
        <!-- <mt-button type="primary" @click.native="prevQuestion"
                   :disabled="current_index < 1">{{current_index <  1 ? '无' :'上一题'}}
        </mt-button> -->
        <mt-button type="primary" @click.native="nextQuestion" v-if="current_index != testList.length-1">下一题</mt-button>
        <mt-button type="primary" @click.native="clickSubmit" v-if="current_index == testList.length-1">提交试卷
        </mt-button>
      </div>

    </div>

   

  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import {Toast, MessageBox, Indicator} from 'mint-ui'
  import {reqPapersInfoByPaperId, reqInsertStudentPaperScore, reqSubmitPaper, getTestById} from '../../api'
  import {getNumberPrefix} from '../../utils/common.js'
  import {mapState, mapActions, mapGetters} from 'vuex'
  import qs from 'qs'

  export default {
    name: "",
    data() {
      return {
        //当前日期
        currentDate: new Date(),
        //路由传值paperId
        paperId: this.$route.params.paperId,
        //试卷信息
        paperInfo: {},
        //试卷问题类型数量
        queNumInfo: {},

        answer_template:{
          questionId: 0,
          value: 0,
          que_type: ''
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
        testId:0,
        testList:[],
        answer:[],
        current_index:0
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
      this.testId = this.$route.params.testId
      this.getTestInfo()
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


      nextQuestion(){
        if(this.setAnswer())
          this.current_index += 1

      },

      prevQuestion(){
        if(this.setAnswer())
          this.current_index -= 1
      },

      //插入学生成绩表成绩信息，包含三个字段，考试开始时间、学号和试卷id
      async insertStudentPaperScore() {
        const {sno, paperId} = this;
        let result = await reqInsertStudentPaperScore({sno, paperId});
        if (result.statu == 0) {
          sessionStorage.setItem("sno" + this.sno + "paperId" + this.paperId, result.msg);
        }
        else {
          Toast({
            message: result.msg,
            duration: 1500
          });
        }
      },

    async getTestInfo(){
      // console.log(this.testId)
      let result = await getTestById(qs.stringify({test_id:this.testId}))
      if(result.status==200){
        this.testList = result.data.questions
        var j;
        for(j=0;j<this.testList.length;j++){
          this.answer.push(JSON.parse(JSON.stringify(this.answer_template)))
        }
      }else{
        Toast({
            message: result.msg,
            duration: 2000
        });
        this.$router.replace('/profile')
      }
    },

      // 根据paperId获取试卷信息和问题数量信息
      async getPaperInfoByPaperId(callback) {
        const {paperId} = this;
        let result = await reqPapersInfoByPaperId({paperId});
        if (result.statu == 0) {
          // console.log(result.data);
          this.paperInfo = result.data.paperInfo;
          this.queNumInfo = result.data.queNumInfo;
          this.singleQueList = result.data.singleQueList;
          this.multipleQueList = result.data.multipleQueList;
          this.judgeQueList = result.data.judgeQueList;
          this.fillQueList = result.data.fillQueList;
          Indicator.close();
          callback && callback()
        }
        else {
          Toast({
            message: result.msg,
            duration: 2000
          });
        }
      },

      //用户手动点击提交试卷按钮，弹出确认框
      clickSubmit(){
        if(!this.setAnswer())
          return
        MessageBox.confirm('确定要提交试卷吗?').then(action => {
          let result = this.handleSubmit();
          if (result){
            //等待成绩计算完毕并插入数据库表
            Indicator.open({
              text: '自动计算成绩中...',
              spinnerType: 'double-bounce'
            });
            setTimeout(() => {
              Indicator.close();
              Toast({
                message:'提交成功，请查看成绩',
                duration: 1500
              });
              //清除sessionStorage数据
              sessionStorage.removeItem("currentIndex");
              sessionStorage.removeItem("singleAnswers");
              sessionStorage.removeItem("multipleAnswers");
              sessionStorage.removeItem("judgeAnswers");
              sessionStorage.removeItem("judgeAnswers");
              sessionStorage.removeItem("fillAnswers");
              sessionStorage.removeItem("firstCurrentTime");
              sessionStorage.removeItem("sno" + this.sno + "paperId" + this.paperId, result.msg);
              //清除vuex数据
              this.refreshCurrentIndex(0);
              this.refreshSingleAnswers([]);
              this.refreshMultipleAnswers([]);
              this.refreshJudgeAnswers([]);
              this.refreshFillAnswers([]);
              this.refreshFirstCurrentTime(0);
              this.$router.replace('/profile/stuscore');
            }, 4000)
          }
          else {
            Toast({
              message:'交卷失败，数据库错误，请重新开始考试',
              duration: 1500
            });
            this.$router.replace('/profile')
          }
        },() => {
          //点击取消按钮操作
        })
      },
      //最终提交答案，包含用户手动点击提交按钮和到时自动提交
      async handleSubmit() {
        let result = await submitTest({
          test_id:this.testId,
          answer:this.answer
        })
        //将考试答案数据提交给后台
        // const {sno, paperId, singleAnswers, multipleAnswers, judgeAnswers, fillAnswers, timeUsed} = this;
        // let result = await reqSubmitPaper({sno, paperId, singleAnswers, multipleAnswers, judgeAnswers, fillAnswers, timeUsed});
        // if (result.statu == 0) {
        //   return true;
        // }
        // else {
        //   return false;
        // }

      },
      //点击上一题
      preItem() {
        this.singleAnswer = '';
        this.multipleAnswer = [];
        this.judgeAnswer = '';
        this.fillAnswer = '';
        this.prevQue();
        this.getCurrentAnswer();
      },
      //点击下一题
      nextItem() {
        this.singleAnswer = '';
        this.multipleAnswer = [];
        this.judgeAnswer = '';
        this.fillAnswer = '';
        this.nextQue();
        this.getCurrentAnswer();
      },
      //点击显示答题卡
      toPaperCard() {
        this.showPaperContainer = false;
        this.showPaperCard = true;
      },
      //点击显示试卷问题
      toPaperQue(index) {
        this.singleAnswer = '';
        this.multipleAnswer = [];
        this.judgeAnswer = '';
        this.fillAnswer = '';
        this.cardQue(index);
        this.getCurrentAnswer();

        this.showPaperCard = false;
        this.showPaperContainer = true;
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
      /*touchToBack() {
        this.toBack()
        // 进入页面时压入的本地连接已消耗，重新给history压入一个本地的连接
        window.history.pushState(null, null, document.URL);
      },*/
      //单选题点击change事件
      singleChange(){
        // const {currentIndex, singleAnswer} = this;
        // // this.recordSingleAnswers({currentIndex, singleAnswer});
        // this.answer[currentIndex].value = singleAnswer
        // console.log(this.answer)
      },
      //多选题点击change事件
      multipleChange(){
        // const {currentIndex, multipleAnswer} = this;
        // this.answer[currentIndex] = multipleAnswer
        // this.recordMultipleAnswers({currentIndex, multipleAnswer});
      },
      //判断题点击change事件
      judgeChange(){
        // const {currentIndex, judgeAnswer} = this;
        // this.recordJudgeAnswers({currentIndex, judgeAnswer});
      },
      //填空题点击change事件
      fillChange(){
        // const {currentIndex, fillAnswer} = this;
        // this.recordFillAnswers({currentIndex, fillAnswer});
      },

      setAnswer(){
        console.log(this.answer)
        if(this.testList[this.current_index].type=='单选'){
          if(this.singleAnswer==''){
            Toast({
              message: '还没有选中选项',
              duration: 1500
            });
            return false
          }
          this.answer[this.current_index].questionId = this.testList[this.current_index].test_id
          this.answer[this.current_index].value=this.singleAnswer
          this.singleAnswer = ''
        }
        if(this.testList[this.current_index].type=='多选'){
          if(this.multipleAnswer.length==0){
            Toast({
              message: '还没有选中选项',
              duration: 1500
            });
            return false
          }
          this.answer[this.current_index].questionId = this.testList[this.current_index].test_id
          this.answer[this.current_index].value=this.multipleAnswer.join(',')
          this.multipleAnswer = []
        }
        if(this.testList[this.current_index].type=='问答'){
          if(this.fillAnswer==''){
            Toast({
              message: '还没有填写内容',
              duration: 1500
            });
            return false
          }
          this.answer[this.current_index].questionId = this.testList[this.current_index].test_id
          this.answer[this.current_index].value=this.fillAnswer
          this.fillAnswer = ''
        }
        return true
      },
      //获取当前题目填写的答案
      getCurrentAnswer(){
        //获取单选题当前答案
        if (this.currentIndex < this.queNumInfo.singleNum) {
          const currentAnswer = this.singleAnswers[this.currentIndex];
          if(currentAnswer){
            this.singleAnswer = currentAnswer;
          }else{
            const {currentIndex, singleAnswer} = this;
            this.recordSingleAnswers({currentIndex, singleAnswer});
          }
        }
        //获取多选题当前答案
        else if (this.currentIndex < (this.queNumInfo.singleNum + this.queNumInfo.multipleNum)) {
          const currentAnswer = this.multipleAnswers[this.currentIndex - this.queNumInfo.singleNum];
          if(currentAnswer){
            this.multipleAnswer = currentAnswer;
          }else{
            const {currentIndex, multipleAnswer} = this;
            this.recordMultipleAnswers({currentIndex, multipleAnswer});
          }
        }
        //获取判断题当前答案
        else if (this.currentIndex < (this.queNumInfo.singleNum + this.queNumInfo.multipleNum + this.queNumInfo.judgeNum)) {
          const currentAnswer = this.judgeAnswers[this.currentIndex - this.queNumInfo.singleNum - this.queNumInfo.multipleNum];
          if(currentAnswer){
            this.judgeAnswer = currentAnswer;
          }else{
            const {currentIndex, judgeAnswer} = this;
            this.recordJudgeAnswers({currentIndex, judgeAnswer});
          }
        }
        //获取填空题当前答案
        else {
          const currentAnswer = this.fillAnswers[this.currentIndex - this.queNumInfo.singleNum - this.queNumInfo.multipleNum - this.queNumInfo.judgeNum];
          if(currentAnswer){
            this.fillAnswer = currentAnswer;
          }else{
            const {currentIndex, fillAnswer} = this;
            this.recordFillAnswers({currentIndex, fillAnswer});
          }
        }
      }
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
