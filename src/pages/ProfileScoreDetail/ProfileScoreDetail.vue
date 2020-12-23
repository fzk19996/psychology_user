<template>
  <section class="score_detail">
    <!--利用$router.back()返回上一级路由 -->
    <HeaderTop title="成绩报告">
      <a href="javascript:" slot="left" class="go_back" @click="$router.goBack()">
        <i class="iconfont iconxiazai6"></i>返回
      </a>
    </HeaderTop>

    <!--试卷标题-->
    <div class="paper_title">
      <span></span>
    </div>

    <!--教师公告无缝跑马灯-->
    <div class="notices_run">
      <i class="iconfont iconxiazai41"></i>

      <!-- <vue-seamless-scroll :data="examCalendar" :class-option="optionLeft" class="seamless-warp2">
        <ul class="item">
          <li>
            最新公告消息:{{examCalendar[0].noticeContent}}
          </li>
        </ul>
      </vue-seamless-scroll> -->
    </div>

    <!--成绩报告图表-->
    <div class="score_chart" style="margin-left:20%">
      <!-- <RingSchart :chartData="chartDataRingScore"/>
      <BarSchart :chartData="chartDataBarCorrect"/>
      <LineSchart :chartData="chartDataLineRanking"/> -->
      <div style="margin-bottom:20px"> 测试名称：{{answer.test_name}}</div>
      <el-row v-for="(tmp,index) in answer.varNameList">
          <el-col >
            测试内容：{{answer.varNameList[index]}}
          </el-col>
          <el-col>
            分数值：{{answer.scoreList[index]}}
          </el-col>
      </el-row>
    </div>
    <div style="margin-top:50px">
      <div style="text-align:center"> 测验结果解释与说明</div>
      <div style="margin-left:20%;margin-right:20%;margin-top:20px;width:60%">
        <mavon-editor
              class="md"
              :value="answer.adminComment"
              :subfield = "false"
              :defaultOpen = "'preview'"
              :toolbarsFlag = "false"
              :editable="false"
              :scrollStyle="true"
              :ishljs = "true"
            ></mavon-editor>
      </div>
    </div>

    <!--点击返回顶部按钮-->
    <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="0" transition-name="fade" />
  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import RingSchart from '../../components/Schart/RingSchart.vue'
  import BarSchart from '../../components/Schart/BarSchart.vue'
  import LineSchart from '../../components/Schart/LineSchart.vue'
  import PieSchart from '../../components/Schart/PieSchart.vue'
  import BackToTop from '../../components/BackToTop'
  import {queryAnswerResult} from '../../api'
  import {Toast, Indicator} from 'mint-ui'
  import { mapState } from 'vuex'
  import {mavonEditor} from 'mavon-editor'
  import 'mavon-editor/dist/css/index.css'
  import qs from 'qs'
  export default {
    name: "",
    data() {
      return {
        myBackToTopStyle: {
          right: '15px',
          bottom: '15px',
          width: '40px',
          height: '40px',
          'border-radius': '4px',
          'line-height': '45px', // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
          background: '#e7eaf1'// 按钮的背景颜色 The background color of the button
        },
        sno:this.$store.state.userInfo.sno,
        answerId:this.$route.params.answerId,
        answer:{}
      }
    },
    created(){
      // Indicator.open({
      //   text: '报告生成中...',
      //   spinnerType: 'snake'
      // });
      this.getAnswer();
    },
    computed: {
      optionLeft () {
        return {
          direction: 2,
          limitMoveNum: 2,
          // hoverStop: false
        }
      },
      ...mapState(['examCalendar'])
    },
    methods: {
      // 获取成绩报告数据
      async getAnswer(){
        let result = await queryAnswerResult(qs.stringify({answer_id:this.answerId}));
        if (result.status == 200){
          this.answer = result.data
          setTimeout(() => {
            Indicator.close();
          }, 500)
        }
        else {
          Indicator.close();
          Toast({
            message:result.msg,
            duration: 1500
          });
        }
      }
    },
    components:{
      HeaderTop,
      RingSchart,
      BarSchart,
      LineSchart,
      PieSchart,
      BackToTop,
      mavonEditor
    }
  }
</script>

<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>
  .score_detail
    padding-top 45px
    width 100%
    background-color #f5f5f5
    padding-bottom 20px
    .paper_title
      width 100%
      height 35px
      display flex
      justify-content center
      align-items center
      font-size 16px
      color #fff
      background-color #4ab8a1
    .notices_run
      display flex
      justify-content center
      align-items center
      background-color rgba(125,125,125,.3)
      color lightcoral
      margin-bottom 20px
      i
        margin-right 10px
        font-weight bolder
      .seamless-warp2
        overflow hidden
        height 30px
        line-height 30px
        width 300px
        font-size 14px
        border-radius 30px
        ul
          width 700px
          li
            float left
            margin-right 10px
    .score_chart
      .score_text
        padding 15px
        div
          display flex
          justify-content center
          span
            color #FF0000
        .percentage_title
          height 30px
          line-height 30px
          font-weight 120px
        p
          height 28px
          line-height 28px
          display flex
          justify-content space-between
          span
            span
              color #FF0000
</style>
