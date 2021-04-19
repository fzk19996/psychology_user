<template>
  <section class="wrong_collection">
    <!--利用$router.back()返回上一级路由 -->
    <HeaderTop title="心理调适列表">
      <a href="javascript:" slot="left" class="go_back" @click="$router.goBack()">
        <i class="iconfont iconxiazai6"></i>返回
      </a>
    </HeaderTop>

    <div class="collections_list">
      <mt-loadmore :top-method="loadTop" ref="loadmore">
        <div v-for="(item, index) in pushList" :key="index" @click="toPushDetail(item)">
          <ProfileItem :title="item.title" icon="iconshoucangxuanzhong"></ProfileItem>
        </div>
      </mt-loadmore>
    </div>

    <!--无收藏题目列表显示的内容-->
    <div class="no_collections_list" v-if="pushList.length==0">
      <img src="../../common/imgs/nopaperwrong.png" alt="">
      <h3>暂无调试列表</h3>
    </div>

    <!--点击返回顶部按钮-->
    <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="0" transition-name="fade" />
  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import ProfileItem from '../../components/ProfileItem/ProfileItem.vue'
  import BackToTop from '../../components/BackToTop'
  import {Toast} from 'mint-ui'
  import {mapState} from 'vuex'
  import {queryUserPushs} from '../../api'
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
        pushList:[],
        offset:0,
        limit:20,
        answers:[]
      }
    },
    created(){
      this.getAllPush();
    },
    computed: {
      optionLeft () {
        return {
          direction: 2,
          limitMoveNum: 2,
          // hoverStop: false
        }
      },
      ...mapState(['userInfo'])
    },
    methods: {
      loadTop() {
        if (this.selectedId === 0){
          this.getAllCollections();
        } else {
          this.getCollectionsById(this.selectedId);
        }
        setTimeout(() => {
          this.$refs.loadmore.onTopLoaded()
        }, 1000)
      },
      async getAllPush(){
        let result = await queryUserPushs();
        if (result.status == 200){
          this.pushList = result.data;
        }
        else {
          Toast({
            message:result.msg,
            duration: 1500
          });
        }
      },
      clickTab(item, index){
        if (item.queType == 0){
          this.getAllCollections();
        }
        else {
          this.getCollectionsById(item.queType);
        }
      },
      toPushDetail(push){
        // console.log('id'+id)
        this.$router.push({name:"push_detail",params:{'push':push}})
      }
    },
    components:{
      HeaderTop,
      ProfileItem,
      BackToTop
    },
    //监听collectionsList长度，确定是否显示暂无收藏题目图标
    watch:{
      collectionsList (value) {
        if (!value.length){
          this.isCollectionsList = true;
        }
        else {
          this.isCollectionsList = false;
        }
      }
    }
  }
</script>

<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>
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
