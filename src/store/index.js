/*
vuex最核心的管理对象store
组装模块并导出 store 的地方
 */
// 首先引入Vue及Vuex
import Vue from 'vue'
import Vuex from 'vuex'

// 引入四个基本模块
// import state from './state'
// import mutations from './mutations'
// import actions from './actions'
// import getters from './getters'

// 一定要声明使用插件
Vue.use(Vuex)

// 把 store 对象提供给 “store” 选项，这可以把 store 的实例注入所有的子组件
export default new Vuex.Store({
  // state,
  // mutations,
  // actions,
  // getters
  state:{
    rotationImages: [],  //首页轮播图数组
    userInfo: {},// 用户信息
    unreadMsgCount: 0,//用户我的页面未读消息条数
    feedbackInfo: [],//消息列表反馈信息数组
    examCalendar: [],//考试日历列表数组
    languagesInfo: [],//首页九宫格编程语言信息

    currentIndex: 0,//当前题目索引，默认为0
    singleAnswers: [],//单选题答案数
    multipleAnswers: [],//多选题答案数组
    judgeAnswers: [],//判断题答案数组
    fillAnswers: [],//填空题答案数组
    firstCurrentTime:0,//花费时间
    answer:{
      table_answer:{
        answer_list:[],
        // table_id:0
      },
      experiment_answer:{
        answer_list:[],
        experiment_id:0
      },
      video_url:'',
      test_id:0
    },
    current_index:0,
    tableIndex:0,
    experimentIndex:0,
    experimentList:[],
    tableList:[],
    experiment_id:0
  },
  mutations:{
    refresh_current_index(state,index){
      state.current_index = index
    },
    refresh_table_index(state, index){
      state.tableIndex = index
    },
    refresh_experiment_index(state, index){
      state.experimentIndex = index
    },
    record_table_list(state, tableList){
      state.tableList = tableList
    },
    refresh_experiment_index(state, index){
      state.experimentIndex = index
    },
    record_experiment_list(state, experimentList){
      state.experimentList = experimentList
    },
    record_answer(state, answer){
      state.answer = answer
    },
    record_experiment_id(state, experiment_id){
      state.experiment_id = experiment_id
    }
  },
})
