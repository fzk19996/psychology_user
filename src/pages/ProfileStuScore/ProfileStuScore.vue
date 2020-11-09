<template>
  <section class="stu_score">
    <!--利用$router.back()返回上一级路由 -->
    <HeaderTop title="查看成绩">
      <a href="javascript:" slot="left" class="go_back" @click="$router.push('/profile')">
        <i class="iconfont iconxiazai6"></i>返回
      </a>
    </HeaderTop>

    <!--教师公告无缝跑马灯-->
    <div class="notices_run">
      <i class="iconfont iconxiazai41"></i>

      <vue-seamless-scroll :data="examCalendar" :class-option="optionLeft" class="seamless-warp2">
        <ul class="item">
          <li>
            最新公告消息
          </li>
        </ul>
      </vue-seamless-scroll>
    </div>

    <!--查看学生全部试卷成绩-->
    <mt-loadmore v-if="answerList.length" :top-method="loadTop" ref="loadmore">
      <div class="score_list" v-for="(item, index) in answerList" :key="item.answerId">
        <div class="score_list_item" :class="{'corner_new':index == 0}">
          <div class="score_create_time">
            考试时间：{{item.createTime}}分钟
          </div>
          <div class="score_item">
            试卷状态：{{item.state}}
          </div>
          <div class="score_participate">
            <div class="score_participate_right">
              <mt-button size="small" type="primary" @click.native="toAnswerDetail(item.answerId)">查看报告</mt-button>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom_tips">
        <span>我是有底线的</span>
      </div>
    </mt-loadmore>

    <!--无成绩显示提示图片-->
    <div class="no_score_list animated" v-show="answerList.length==0">
      <img src="../../common/imgs/nopaper.png" alt="">
      <h3>暂无提交答案</h3>
    </div>

    <!--点击返回顶部按钮-->
    <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="0" transition-name="fade" />
  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import Star from '../../components/Star/Star.vue'
  import BackToTop from '../../components/BackToTop'
  import {queryAnswerResult, queryUserAnswers} from '../../api'
  import {Toast, Indicator} from 'mint-ui'
  import { mapState } from 'vuex'
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
        answerList:[]
      }
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
    created(){
      this.getAnswerList();
    },
    methods: {
      loadTop() {
        this.getPaperScoreInfo()
        setTimeout(() => {
          this.$refs.loadmore.onTopLoaded()
        }, 1000)
      },
      async getAnswerList(){
        const {sno} = this;
        let result = await queryUserAnswers();
        if(result.status == 200){
          this.answerList = result.data;
          console.log(this.scoreList)
        }
        else {
          Toast({
            message:result.msg,
            duration: 1500
          });
        }
      },
      toAnswerDetail(answerId){
        /*Indicator.open({
          text: '加载中...',
          spinnerType: 'fading-circle'
        });*/
        this.$router.push('/profile/stuscore/detail/' + answerId)
/*        setTimeout(() => {
          Indicator.close();
        }, 300)*/
      }
    },
    components:{
      HeaderTop,
      Star,
      BackToTop
    }
  }
</script>

<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>
  @import "../../common/stylus/mixins.styl"
  .stu_score
    padding-top 45px
    width 100%
    background-color #f5f5f5
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
    .no_score_list
      display flex
      flex-direction column
      align-items center
      padding-top 100px
      >h3
        font-size 17px
        color #6a6a6a
    .score_list
      width 100%
      display flex
      flex-direction column
      .score_list_item
        width 80%
        margin 0 auto
        margin-bottom 20px
        padding 25px 20px 20px 20px
        background-color #fff
        background-image url("../../common/imgs/corner-score.png"), url("../../common/imgs/paper-right-top.png"), url("../../common/imgs/score-confirm.png"), url("../../common/imgs/corner-complete.png")
        background-size 36px 36px, 40px 40px, 45px 45px, 50px 50px
        background-repeat no-repeat, no-repeat, no-repeat, no-repeat
        background-position 50% 1%, 100% 0%, 87% 50%, 92% 6%
        border-radius 5px
        box-shadow 0 0 3px #ccc
        &.corner_new
          background-image url("../../common/imgs/corner-score.png"), url("../../common/imgs/paper-right-top.png"), url("../../common/imgs/score-confirm.png"), url("../../common/imgs/corner-mark-new.png"), url("../../common/imgs/corner-complete.png")
          background-size 36px 36px, 40px 40px, 45px 45px ,40px 40px, 50px 50px
          background-repeat no-repeat, no-repeat, no-repeat, no-repeat, no-repeat
          background-position 50% 1%, 100% 0%, 87% 50%, 0% 0%, 92% 6%
        .score_title
          height 50px
          line-height 50px
          font-size 16px
          display flex
          justify-content center
        .score_type
          height 30px
          line-height 30px
          font-size 14px
          color #999
        .score_create_time,.score_total_score
          height 30px
          line-height 30px
          font-size 14px
          color #999
        .score_item
          height 30px
          line-height 30px
          font-size 14px
          color #d9534f
        .score_important
          font-weight bold
        .score_difficulty
          height 30px
          line-height 30px
          font-size 14px
          color #999
          .star
            display inline-block
            float none
        .score_participate
          height 50px
          line-height 50px
          font-size 16px
          display flex
          justify-content space-between
          .score_participate_left
            color lightslategray
            display flex
            align-items center
            >img
              width 25px
              height 25px
</style>
