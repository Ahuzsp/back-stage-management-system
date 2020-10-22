<template>
  <div class="login">
    <div class="login-box">
      <h2>后台管理系统</h2>
      <el-form ref="Loginform" :model="Loginform" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="Loginform.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="Loginform.password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="submitForm" type="primary">登录</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      Loginform: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm () {
      this.$refs.Loginform.validate(async valid => {
        if (valid) {
          // alert('欢迎用户'+this.form.name+'!')
         const {data: res} = await this.$http.post('login', this.Loginform);
         console.log(res);
         if(res.meta.status==200){
           window.sessionStorage.setItem('token', res.data.token)
           this.$message.success(this.Loginform.username+'登陆成功')
           this.$router.push('/home')
         }else{
           this.$message.error('用户名或密码错误')
         }
        }else{
          return
        }
      })
    },
    resetForm () {
      this.$refs.Loginform.resetFields()
    }
  }
}
</script>

<style>
.login {
  width: 100%;
  height: 100%;
  background-color: rgba(95, 95, 129, 0.4);
  overflow: hidden;
}
.login-box {
  position: relative;
  width: 450px;
  height: 300px;
  border-radius: 5px;
  box-shadow: 0 0 10 rgba(0, 0, 5, 0.4);
  background: #fff;
  margin: 200px auto;
  background: rgb(115, 119, 131);
}
.login-box .el-form {
  position: absolute;
  bottom: 22px;
  width: 100%;
  height: 167px;
  padding: 0 20px;
  text-align: center;
  box-sizing: border-box;
}
h2 {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

</style>
