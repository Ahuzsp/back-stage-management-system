<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">权限管理</el-button>
        </el-col>
      </el-row>
      <el-table :data="rightsList" border stripe>
        <el-table-column prop="id" label="id" align="center"></el-table-column>
        <el-table-column prop="authName" label="权限名" align="center"></el-table-column>
        <el-table-column label="权限等级" align="center">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.level==0">等级一</el-tag>
            <el-tag type="danger" v-else-if="scope.row.level==1">等级二</el-tag>
            <el-tag type="waring" v-else>等级三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getRightList();
  },
  data() {
    return {
      rightsList: [],
    };
  },
  methods: {
    async getRightList() {
      const { data: res } = await this.$http.get("rights/list");
      if(res.meta.msg !== 200)  this.$message.error('获取权限列表失败')
      this.rightsList = res.data;
      this.$message.success('获取权限列表成功')
    },
  },
};
</script>

<style scoped>
.el-card {
  margin: 15px 0;
  box-shadow: none;
}
.el-table {
    margin: 35px 0;
}
</style>