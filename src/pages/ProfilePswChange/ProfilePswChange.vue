<template>
  <section class="profile_psw_change">
    <!--利用$router.back()返回上一级路由 -->
    <HeaderTop title="密码修改">
      <a href="javascript:" slot="left" class="go_back" @click="$router.goBack()">
        <i class="iconfont iconxiazai6"></i>返回
      </a>
    </HeaderTop>

    <div class="profile_psw_change_field">
      <mt-field label="新密码" placeholder="请输入新密码" type="password" v-model="newPassword"></mt-field>
      <mt-field label="确认新密码" placeholder="请再次输入新密码" type="password" v-model="newPasswordConfirm"></mt-field>
      <mt-button type="primary" size="large" @click="checkPswChange">确定</mt-button>
    </div>
  </section>
</template>

<script>
  import HeaderTop from '../../components/HeaderTop/HeaderTop.vue'
  import {updatePassword} from '../../api'
  import {Toast, MessageBox} from 'mint-ui'
  import qs from 'qs'
  export default {
    name: "",
    data() {
      return {
        newPassword:'',
        newPasswordConfirm:''
      }
    },
    methods: {
      async checkPswChange(){
        if(this.newPassword!=this.newPasswordConfirm){
          Toast({
            message: '密码不一致',
            duration: 1500
          });
        }
        let result = await updatePassword(qs.stringify({password:this.newPassword}));
        if (result.status == 200) {
          Toast({
            message: '密码修改成功',
            iconClass: 'iconfont iconunie045',
            duration: 1500
          });
        }
        else {
          Toast({
            message: result.msg,
            duration: 1500
          });
        }
      }
    },
    components:{
      HeaderTop
    }
  }
</script>

<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>
  .profile_psw_change
    padding-top 45px
    .profile_psw_change_field
      margin-top 15px
      .mint-button
        background-color #4ab8a1
        margin-top 15px
</style>
