<template>
  <section class="wrong_collection">
    <!--利用$router.back()返回上一级路由 -->
    <HeaderTop title="查看测试">
      <a href="javascript:" slot="left" class="go_back" @click="$router.goBack()">
        <i class="iconfont iconxiazai6"></i>返回
      </a>
    </HeaderTop>

    <!--显示收藏题目列表-->
    <div class="collections_list">
      <mt-loadmore :top-method="loadTop" ref="loadmore">
        <div v-for="(item, index) in testList" :key="index" @click="toCollectionDetail(item)">
          <ProfileItem :title="item.title" icon="iconshoucangxuanzhong"></ProfileItem>
        </div>
      </mt-loadmore>
    </div>

    <!--无收藏题目列表显示的内容-->
    <div class="no_collections_list" v-if="userInfo.sno && isCollectionsList">
      <img src="../../common/imgs/nopaperwrong.png" alt="">
      <h3>暂无收藏记录</h3>
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
  import {reqAllCollections, reqCollectionsById, getTestList} from '../../api'
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
        noticesList:this.$store.state.examCalendar,
        selectedId: 0,
        items:[
          {queType:0, label:'全部'},
          {queType:1, label:'单选题'},
          {queType:2, label:'多选题'},
          {queType:3, label:'选择题'},
          {queType:4, label:'填空题'}
        ],
        options: {
          activeColor: '#4ab8a1',
          // 可在这里指定labelKey为你数据里文字对应的字段
          // labelKey: 'langName'
        },
        collectionsList:[],
        isCollectionsList:false,
        testList:[],
        index:0,
        limit:20,
        answers:[]
      }
    },
    created(){
      this.getAllTest();
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
      async getAllTest(){
        let result = await getTestList(qs.stringify({index:this.index, limit:this.limit}));
        if (result.status == 200){
          this.testList = result.data;
        }
        else {
          Toast({
            message:result.msg,
            duration: 1500
          });
        }
      },
      async getCollectionsById(queType){
        let result = await reqCollectionsById(this.sno, queType);
        if (result.statu == 0){
          this.collectionsList = result.data;
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
      toCollectionDetail(test_info){
        this.$router.push({name:"table",params:{'experiment_id':test_info.experiment_id,'table_id':test_info.table_id,'test_id':test_info.test_id}})
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
