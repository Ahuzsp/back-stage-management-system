<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">角色管理</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 第一层for循环得到一级权限 -->
            <el-row
              :key="item1.id"
              v-for="(item1,i1) in scope.row.children"
              :class="['bb', i1==0? 'bt' : '', 'scenter']"
            >
              <el-col :span="6">
                <el-tag closable
                 @close="handleClose(scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="18">
                <!-- 第二层for循环得到二级权限 -->
                <el-row
                  :key="item2.id"
                  v-for="(item2,i2) in item1.children"
                  :class="[i2==0 ? '' : 'bt', 'scenter']"
                >
                  <el-col :span="10">
                    <el-tag type="success" closable 
                    @close="handleClose(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="14">
                    <!-- 第三层for循环得到三级权限 -->
                    <el-col>
                      <el-tag
                        @close="handleClose(scope.row,item3.id)"
                        :key="item3.id"
                        v-for="item3 in item2.children"
                        type="warning"
                        closable
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="100px"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" @click="showDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分配权限提示框 -->
      <el-dialog :visible.sync="dialogVisible" 
      width="30%" 
      @closed="setRightDialogClosed"
      :close-on-click-modal="false"
      >
        <el-tree
          :data="treeRights"
          :props="defaultProps"
          ref="getIds"
          default-expand-all
          show-checkbox
          node-key="id"
          :default-checked-keys="defaultCheckList"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getRoleList();
  },
  data() {
    return {
      rolesList: [],
      dialogVisible: false,
      treeRights: [],
      defaultProps: {
        children: "children",
        label: "authName",
      },
      defaultCheckList: [],
      rid: ''
    };
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      //console.log(res);
      this.rolesList = res.data;
    },
    async handleClose(sr, id) {
      //弹出提示框
      let confirmStr = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch(err => err);
      if (confirmStr !== "confirm") return this.$message.info("取消删除成功");
      const { data: res } = await this.$http.delete(
        `roles/${sr.id}/rights/${id}`
      );
      // console.log(res);
      if (res.meta.status !== 200) this.$message.error("删除用户权限失败");
      this.$message.success("删除用户权限成功");
      //返回的是最新的权限值
      sr.children = res.data;
    },
    async showDialog(role) {
      this.rid = role.id
      this.dialogVisible = true;
      //以树形结构获取所有权限列表
      const { data: res } = await this.$http.get("rights/tree");
      this.treeRights = res.data;
      console.log(this.treeRights);
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defaultCheckList);
    },
    //获取所有三级权限的id值
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr));
    },
        // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defaultCheckList = []
    },
    async allotRights() {
      const keys = [...this.$refs.getIds.getCheckedKeys(),
                    ...this.$refs.getIds.getHalfCheckedKeys()]
      // console.log(keys);
      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.rid}/rights`, {rids:idStr})
      if(res.meta.status!==200) this.$message.error('修改权限失败')
      console.log(res);
      this.$message.success('修改权限成功')
      this.getRoleList()
      this.dialogVisible = false
    }

  },
};
</script>

<style scoped>
.el-card {
  margin-top: 15px;
  box-shadow: none !important;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 15px 20px 3px 0;
}
.bt {
  border-top: 1px solid #ccc;
}
.bb {
  border-bottom: 1px solid #ccc;
}
.scenter {
  display: flex;
  align-items: center;
}
</style>