<template>
<section class="wrong_collection">
    <HeaderTop :title="push.name">
        <a href="javascript:" slot="left" class="go_back" @click="$router.goBack()">
            <i class="iconfont iconxiazai6"></i>返回
        </a>
    </HeaderTop>
    <div id="article" class="content3 container">
		<leftNav></leftNav>
		<div class="contentArt fr">
			<div class="article">
				<div class="article_title container">
					<h4>{{article.title}}</h4>
				</div>
				<span v-html="article.content"></span>
			</div>
		</div>
	</div>
    <div>
        <el-button @click="toTest" >进入测试</el-button>
    </div>
</section>

 
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import {Toast, MessageBox, Indicator} from 'mint-ui'
  import { queryArticleById, getTestById, beginExam} from '../../api'
  import {getNumberPrefix} from '../../utils/common.js'
  import {mapState, mapActions, mapGetters} from 'vuex'
  import qs from 'qs'

  export default {
    name: "",
    data() {
      return {
        //当前日期
        push: {},
        article: {},
        test: {}
      }
    },
    components:{
      HeaderTop
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
      this.push = this.$route.params.push
      this.getArticle()
      console.log(this.push)
    },
    methods: {
      
        async getArticle(){
          let res = await queryArticleById(this.push.articleId)
          if(res.status==200){
            this.article = res.data
          }
        },

        async toTest(){

          let result = await beginExam(qs.stringify({test_id:this.push.testId}));
          console.log(result.data)
          if (result.status == 200){
            if(result.data==-1){
              Toast({
                message:"加载试卷失败",
                duration: 1500
              });
              return;
            }
            else if(result.data==1){
              Toast({
                message:"加载试卷成功，开始测试",
                duration:1500
              })
              this.$router.push({name:"table", params:{mode:"new"}})
              return
            }
            else if(result.data==2){
              console.log('有考试正在进行')
              if(confirm('检查到还有考试正在进行，是否需要继续')==true){
                this.$router.push({name:"table",params:{mode:"continue"}})
                return
              }else{
                let result = await endExam();
                if(result.status!=200){
                  Toast({
                    message:"结束考试失败",
                    duration:2000
                  })
                }else{
                  this.toTest(test_info);
                  return;
                }
              }
              return;
            }
          }
          Toast({
            message:"出现异常情况",
            duration: 1500
          });
      }

    }

        
  }

   
</script>


<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>
  @import "../../common/stylus/mixins.styl"
  .content3
    width 1200px
    min-height 650px
    margin-top 38px
  .contentArt
    width 890px
    margin-top 10px
    margin-right 10px
  .article_title
    height 70px
    line-height 70px
    font-size 18px
    text-align center
    border-bottom 1px 
    dotted #999
    margin-bottom 15px
    .span
      text-indent 2em
      margin-left 100px
	    .p
        line-height 25px
        letter-spacing 2px
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
        padding 0 auto
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
        text-align center
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
.wrong_collection
    padding-top 45px
    width 100%
    background-color #f5f5f5
    .notices_run
      display flex
      justify-content center
      align-items center
      background-color rgba(125,125,125,.3)
      color lightcoral
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
    .no_collections_list
      display flex
      padding-top 100px
      flex-direction column
      align-items center
      >img
        width 250px
        height 250px
      >h3
        font-size 17px
        color #6a6a6a
    .collections_list
      padding-bottom 6px
</style>


