<template>
  <el-container>
    <el-header>
      <div class="left">
        <img src="../assets/logo.jpg" alt="" class="logo">
        <h1>放心购后台管理系统</h1>
      </div>
      <div class="avatar">
         <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
      </div>
      <a @click.prevent="goback" class="exit">
          <img src="../assets/tcl.png" title="退出系统">
      </a>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="collapse" @click="collapse">|||</div>
        <el-menu
          background-color="#303133"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          router 
          :default-active='activePath'
          :collapse=isCollapse
          :collapse-transition='false'
        >
        <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" :key="item.id" v-for="item in menuList">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
          <!-- 二级菜单 -->
            <el-menu-item :index="'/' + menuItem.path" :key="menuItem.id" v-for="menuItem in item.children" @click="getActivePath('/' + menuItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{menuItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        "125": "iconfont icon-user",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao",
      },
      activePath: "",
      isCollapse: false
    }
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    goback() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      let { data: res } = await this.$http.get("menus");
      if (res.meta.status == 200) this.menuList = res.data;
      // console.log(this.menuList);
    },
    getActivePath(path) {
      // console.log(path);
      window.sessionStorage.setItem('activePath', path)
      this.activePath = path;
    },
    collapse() {
      this.isCollapse = !this.isCollapse
    }
  }
};
</script>

<style scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #409EFF;
}
.el-header h1 {
  font-family: SimSun;
  color: #fff;
}
.iconfont {
  font-size: 20px;
  margin-right: 10px;
}
.el-button {
  float: right;
}
.el-aside {
  background-color: #303133;
}
.el-aside .el-menu {
  border-right: none;
}
.el-main {
  background-color: #eaedf1;
}
.collapse {
  height: 30px;
  color: #fff;
  text-align: center;
  line-height: 30px;
  letter-spacing: 0.3em;
  cursor: pointer;
}
.logo {
  float: left;
  height: 60px;
  margin: 0 10px 0 20px
}
.exit {
  width: 30px;
  height: 30px;
  margin-right: 20px;
  cursor: pointer;
}
.exit img {
  width: 100%;
}
.left {
  width: 500px;
  height: 60px;
}
.avatar {
 margin-right: -1700px;
}
</style>