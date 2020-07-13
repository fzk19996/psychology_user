<template>
  <section class="paper">
    <HeaderTop :title="tableData.title" class="paper_header">
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
      <span class="paper_date">考试日期：</span>
      <span class="paper_duration">考试时长：分钟</span>
    </div>

    <!--时间提醒和当前题数-->
    <template v-if="JSON.stringify(tableData)!=='{}'">
    <div class="paper_sub_title_second">
      <span class="paper_clock"><i class="iconfont iconjishiqi"></i></span>
      <span class="paper_statistics"><i class="iconfont icontongji"></i>量表个数：{{tableIndex+1}}/{{tableNum}}&nbsp题目个数：{{current_index+1}}/{{tableData.questions.length}}</span>
    </div>
    </template>

    <!--考卷进度条提醒-->
    <div>
      <!-- <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"></el-progress> -->
    </div>

    <!-- 缓存路由组件对象 -->
    <!--    <keep-alive>
          <router-view></router-view>
        </keep-alive>-->

    <!--试卷问题及选项区域-->
    <div class="paper_container">
      <!-- <template v-if="JSON.stringify(tableData)!=='{}'"> -->
      <section class="que" v-for="(item, index) in tableData.questions" :key="index"
               v-show="index == current_index">
        <div class="content">
          <template v-if="item.type=='单选'">
            <span class="que_type">{{item.type}}</span>
            <span class="que_content">{{index + 1}}.&nbsp;{{item.question}}<span class="que_score"></span></span>
            <div v-for="(option, optionIndex) in item.options"
                :key="'single'+ item.option_id + optionIndex">
              <div class="single_option">
              <mu-radio :value="optionIndex" v-model="singleAnswer" :label="option.content" v-if="option.content"  ></mu-radio>
              </div>
            </div>
          </template>
          <template v-if="item.type=='多选'">
            <span class="que_type">{{item.type}}</span>
            <span class="que_content">{{index + 1}}.&nbsp;{{item.question}}<span class="que_score"></span></span>
            <!-- <div class="multiple_option" v-for="(option, optionIndex) in item.options"
               :key="'multiple'+ item.option_id + optionIndex">
            <mu-checkbox :value="optionIndex+''" v-model="multipleAnswer" :label="option.content" style="margin-left:50px"
                        ></mu-checkbox>
            </div> -->
            <el-checkbox-group v-model="multipleAnswer">
              <el-checkbox  :label="option_index" :key="option_index" v-for="(option, option_index) in item.options">{{option.content}}</el-checkbox>
            </el-checkbox-group>
          </template>
          <template v-if="item.type=='填空'">
            <span class="que_type">{{item.type}}</span>
            <span class="que_content">{{index + 1}}.&nbsp;{{item.question}}<span class="que_score"></span></span>
            <div class="fill_option">
              <mu-text-field v-model="fillAnswer" label="填写答案" full-width multi-line :rows="3" :rows-max="6"></mu-text-field>
            </div>
          </template>
        </div>
      </section>
      <!--上一题和下一题按钮-->
      <div class="paper_button">
      </div>
      <!-- </template> -->

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
        
        answer:{
            answer_list:[],
            current_index:0,
            table_id:''
        },

        answer_template:{
          question_id: '',
          answer:''
        },

        //单选题数组
        singleQueList: [],
        //单选题答案
        singleAnswer: '',

        //多选题数组
        multipleQueList: [],
        //多选题答案
        multipleAnswer: [],
        fillAnswer:'',
     
        experiment:{},
        tableData:{},
        current_index:0 ,
        tableIndex: 0,
        tableNum:this.$store.state.tableList.length
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
        'tableList',
        'tableIndex'
      ]),
      ...mapGetters(['completeNumber'])
    },

    created() {
      // Indicator.open({
      //   text: '加载中...',
      //   spinnerType: 'fading-circle'
      // });
      // this.table_id = this.$route.params.table_id
      // this.experiment_id = this.$route.params.experiment_id
      // this.test_id = this.$route.params.test_id
      // if(this.table_id === ''){
      //    this.$router.push({name:"experiment",params:{'experiment_id':this.$route.params.experiment_id}})
      // }
      this.table_id = this.$store.state.tableList[this.$store.state.tableIndex]
      this.getTableInfo()
      var that = this;
      document.onkeydown = function(e) {
            //事件对象兼容
            let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
            //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
            //左
            if(e1 && e1.keyCode==49+0){ //按键1
                var question_now = that.tableData.questions[that.current_index]
                if(question_now.options.length>=1){
                    if(question_now.type=='单选'){
                        that.singleAnswer = 0
                    }
                    else if(question_now.type=='多选'){
                        console.log(that.multipleAnswer)
                        for(var i=0;i<that.multipleAnswer.length;i++){
                          if(that.multipleAnswer[i] === 0){
                              that.multipleAnswer.splice(i, 1)
                              return
                          }
                        }
                        that.multipleAnswer.push(0)
                    }
                }
            }
            else if(e1 && e1.keyCode==49+1){ //按键2
                var question_now = that.tableData.questions[that.current_index]
                console.log(question_now)
                if(question_now.options.length>=2){
                    if(question_now.type=='单选'){
                        that.singleAnswer = 1
                    }
                    else if(question_now.type=='多选'){
                        for(var i=0;i<that.multipleAnswer.length;i++){
                          if(that.multipleAnswer[i] === 1){
                              that.multipleAnswer.splice(i, 1)
                              return
                          }
                        }
                        that.multipleAnswer.push(1)
                    }
                }
            }
            else if(e1 && e1.keyCode==49+2){ //按键3
                var question_now = that.tableData.questions[that.current_index]
                console.log(question_now)
                if(question_now.options.length>=3){
                    if(question_now.type=='单选'){
                        that.singleAnswer = 2
                    }
                    else if(question_now.type=='多选'){
                        for(var i=0;i<that.multipleAnswer.length;i++){
                          if(that.multipleAnswer[i] === 2){
                              that.multipleAnswer.splice(i, 1)
                              return
                          }
                        }
                        that.multipleAnswer.push(2)
                    }
                }
            }
            else if(e1 && e1.keyCode==49+3){ //按键4
                var question_now = that.tableData.questions[that.current_index]
                console.log(question_now)
                if(question_now.options.length>=4){
                    if(question_now.type=='单选'){
                        that.singleAnswer = 3
                    }
                    else if(question_now.type=='多选'){
                        for(var i=0;i<that.multipleAnswer.length;i++){
                          if(that.multipleAnswer[i] === 3){
                              that.multipleAnswer.splice(i, 1)
                              return
                          }
                        }
                        that.multipleAnswer.push(3)
                    }
                }
            }
            else if(e1 && e1.keyCode==49+4){ //按键5
                var question_now = that.tableData.questions[that.current_index]
                if(question_now.options.length>=5){
                    if(question_now.type=='单选'){
                        that.singleAnswer = 4
                    }
                    else if(question_now.type=='多选'){
                        for(var i=0;i<that.multipleAnswer.length;i++){
                          if(that.multipleAnswer[i] === 4){
                              that.multipleAnswer.splice(i, 1)
                              return
                          }
                        }
                        that.multipleAnswer.push(4)
                    }
                }
            }
            else if(e1 && e1.keyCode==49+5){ //按键6
                var question_now = that.tableData.questions[that.current_index]
                console.log(question_now)
                if(question_now.options.length>=6){
                    if(question_now.type=='单选'){
                        that.singleAnswer = 5
                    }
                    else if(question_now.type=='多选'){
                        for(var i=0;i<that.multipleAnswer.length;i++){
                          if(that.multipleAnswer[i] === 5){
                              that.multipleAnswer.splice(i, 1)
                              return
                          }
                        }
                        that.multipleAnswer.push(5)
                    }
                }
            }
            else if(e1 && e1.keyCode==49+6){ //按键7
                var question_now = that.tableData.questions[that.current_index]
                console.log(question_now)
                if(question_now.options.length>=7){
                    if(question_now.type=='单选'){
                        that.singleAnswer = 6
                    }
                    else if(question_now.type=='多选'){
                        for(var i=0;i<that.multipleAnswer.length;i++){
                          if(that.multipleAnswer[i] === 6){
                              that.multipleAnswer.splice(i, 1)
                              return
                          }
                        }
                        that.multipleAnswer.push(6)
                    }
                }
            }
            else if(e1 && e1.keyCode==13){
                if(that.setAnswer()==true){
                    that.answer.current_index += 1
                    that.answer.table_id = that.table_id
                    sessionStorage.setItem('table_answer',JSON.stringify(that.answer))
                    if(that.current_index<that.tableData.questions.length-1){
                        that.current_index += 1
                        that.$store.commit('refresh_current_index', (that.$store.state.current_index+1))
                        // that.$store.commit('refresh_current_index', 10)
                        console.log('加了数据')
                    }else{
                        console.log('table的index：'+that.$store.state.tableIndex)
                        if(that.$store.state.tableIndex<(that.$store.state.tableList.length-1)){
                          console.log('加载table')
                          that.tableIndex += 1
                          that.$store.commit('refresh_current_index', (that.$store.state.current_index+1))
                          that.$store.commit('refresh_table_index', (that.$store.state.tableIndex+1))
                          that.table_id = that.$store.state.tableList[that.$store.state.tableIndex]
                          that.getTableInfo()
                          
                        }else{
                          console.log('跳转到实验页面')
                          that.$router.push({name:"experiment",params:{'experiment_id':that.experiment_id,'test_id':that.test_id}})
                        }
                    }
                } 
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



    async getTableInfo(){
      // console.log(this.testId)
      this.current_index = 0
      let result = await getTableById({table_id:this.table_id})
      if(result.status==200){
        console.log('量表数据')
        this.tableData = result.data
        console.log(this.tableData)
        for(var i=0;i<this.tableData.questions.length;i++){
            this.answer.answer_list.push('')
        }
        this.answer.table_id = this.table_id
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
        var answer_final = ''
        if(this.tableData.questions[this.current_index].type=='单选'){
            if(this.singleAnswer===''){
                Toast({
                    message: '还没有选择选项',
                    duration: 1500
                });
                return false
            }else{
                answer_final = this.singleAnswer
                // this.answer.answer_list[this.current_index] = this.singleAnswer
                this.singleAnswer = ''
            }
        }
        else if(this.tableData.questions[this.current_index].type=='多选'){
           if(this.multipleAnswer.length===0){
                Toast({
                    message: '还没有选择选项',
                    duration: 1500
                });
                return false
           }else{
                answer_final = this.multipleAnswer.join(';')
                // this.answer.answer_list[this.current_index] = this.multipleAnswer.join(';')
                this.multipleAnswer = []
            }
        }
        else if(this.tableData.questions[this.current_index].type=='填空'){
          // this.answer.answer_list[this.current_index] = this.fillAnswer
          if(this.fillAnswer.length==0){
              Toast({
                message: '还没有填空',
                duration: 1500
              });
              return false
          }
          answer_final = this.fillAnswer
          this.fillAnswer = ''
        }
        var answer = this.$store.state.answer
        var tmp = JSON.parse(JSON.stringify(this.answer_template))
        tmp.question_id = this.tableData.questions[this.current_index].question_id
        tmp.answer = answer_final
        console.log(this.$store.state.current_index)
        if(this.$store.state.current_index>=this.$store.state.answer.table_answer.answer_list.length){
          answer.table_answer.answer_list.push(tmp)
        }else{
          console.log('没有推数据')
          console.log(this.$store.state.current_index)
          answer.table_answer.answer_list[this.$store.state.current_index] = tmp
        }
        this.$store.commit('record_answer', answer)
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
          return false
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
