<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <div>
            <el-input
              placeholder="请输入搜索内容"
              v-model="usersParams.query"
              clearable
              @clear="getUsers"
              @input="getUsers"
            >
              <el-button @click="getUsers" slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="18">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="id" label="id"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="mobile" label="手机"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            @click="searchUser(scope.row.id)"
            type="primary"
            icon="el-icon-edit"
            size="mini"
          ></el-button>
          <el-button @click="delUser(scope.row.id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button
              @click="setRole(scope.row)"
              type="warning"
              icon="el-icon-setting"
              size="mini"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="usersParams.pagenum"
      :page-sizes="[1, 4, 7, 10]"
      :page-size="usersParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      center
      width="25%"
      :close-on-click-modal="false"
      @close="dialogClose"
    >
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item label="用户名" label-width="70px" prop="username">
          <el-input
            placeholder="请输入用户名"
            v-model="form.username"
            autocomplete="off"
            clearable
            autofocus
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="70px" prop="password">
          <el-input placeholder="请输入密码" v-model="form.password" show-password clearable></el-input>
        </el-form-item>
        <el-form-item label="手机" label-width="70px" prop="mobile">
          <el-input placeholder="请输入手机号码" v-model="form.mobile" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="70px" prop="email">
          <el-input placeholder="请输入邮箱" v-model="form.email" autocomplete="off" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      center
      width="25%"
      :close-on-click-modal="false"
    >
      <el-form ref="editForm" :model="editForm" :rules="rules">
        <el-form-item label="用户名" label-width="70px">
          <el-input
            placeholder="请输入用户名"
            v-model="editForm.username"
            autocomplete="off"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item label="手机" label-width="70px" prop="mobile">
          <el-input placeholder="请输入手机号码" v-model="editForm.mobile" autocomplete="off" clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="70px" prop="email">
          <el-input placeholder="请输入邮箱" v-model="editForm.email" autocomplete="off" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser('editForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="roledialogVisible" width="30%" @closed="roleDialogclose">
        <p>当前的用户：{{fpusername}}</p>
        <p>当前的角色：{{fprolename}}</p>
      <el-row>
        <el-col>
          分配新角色：
          <el-select v-model="roleid" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="fpRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUsers();
  },
  data() {
    return {
      //作为参数传递的对象
      usersParams: {
        query: "",
        pagenum: 1,
        pagesize: 4,
      },
      tableData: [],
      //管理员总数
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      roledialogVisible: false,
      //添加用户数据对象
      form: {
        username: "",
        password: "",
        mobile: "",
        email: "",
      },
      formLabelWidth: "120px",
      //校验规则
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "必填项", trigger: "change" },
          { type: "string", message: "必须为数字值", trigger: "blur" },
          {
            pattern: /^1[34578]\d{9}$/,
            message: "请输入正确的手机号",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            pattern: /^[0-9a-zA-Z]+([\.\-_]*[0-9a-zA-Z]+)*@([0-9a-zA-Z]+[\-_]*[0-9a-zA-Z]+\.)+[0-9a-zA-Z]{2,6}$/,
            message: "请输入正确的邮箱",
            trigger: "blur",
          },
        ],
      },
      //修改用户数据对象
      editForm: {
        id: "",
        username: "",
        mobile: "",
        email: "",
      },

      //接收角色列表数据
      roleList: [],
      // 用于接收分配角色的用户名和角色名
      fprolename: '',
      fpusername: '',
      //选中的用户id
      uid: '',
      //选中的角色ID，双向绑定到select
      roleid: '',
    };
  },
  methods: {
    async getUsers() {
      let { data: res } = await this.$http.get("users", {
        params: this.usersParams,
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.tableData = res.data.users;
      this.total = res.data.total;
    },
    //获取当前页
    handleCurrentChange(newpage) {
      this.usersParams.pagenum = newpage;
      this.getUsers();
    },
    //每页数量
    handleSizeChange(newsize) {
      this.usersParams.pagesize = newsize;
      this.getUsers();
    },
    //添加用户
    addUser() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.form);
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败！");
        }
        this.$message.success("添加用户成功！");
        this.getUsers();
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
      });
    },
    //删除用户
    async delUser(id) {
      let confirmMsg = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch(err => err);
      if (confirmMsg !== "confirm") return this.$message.info("已取消删除");
      let { data: res } = await this.$http.delete(`users/${id}`);
      this.$message.success("删除用户成功！");
      this.getUsers();
    },
    //更改用户状态
    async changeUserState(info) {
      let { data: res } = await this.$http.put(
        `users/${info.id}/state/${info.mg_state}`
      );
      if (res.meta.status !== 200) {
        info.mg_state = !info.mg_state;
        this.$message.error("用户状态更新失败");
      } else this.$message.success("用户状态更新成功");
      // console.log(res);
    },
    //修改用户信息
    editUser(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return;
        let { data: res } = await this.$http.put("users/" + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        });
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("修改用户信息错误");
        } else {
          this.editDialogVisible = false;
          this.getUsers();
          return this.$message.success("修改用户信息成功");
        }
      });
    },
    //根据ID查询用户信息
    async searchUser(id) {
      this.editDialogVisible = true;
      let { data: res } = await this.$http.get(`users/${id}`);
      this.editForm.id = res.data.id;
      this.editForm.username = res.data.username;
      this.editForm.mobile = res.data.mobile;
      this.editForm.email = res.data.email;
    },
    //获取用户角色信息
    async setRole(role) {
      // console.log(role.username,role.role_name);
      this.fprolename = role.username
      this.fpusername = role.role_name
      this.uid = role.id
      const {data: res} = await this.$http.get('roles')
      // console.log(res);
      if(res.meta.status !== 200){
        return this.$http.error('获取角色信息失败')
      }
      this.roleList = res.data
      this.roledialogVisible = true;
    },
    //分配角色
    async fpRole() {
      console.log(this.roleid);
      const {data: res} = await this.$http.put(`users/${this.uid}/role`,{rid:this.roleid})
      if(res.meta.status !==200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.roledialogVisible = false
      this.getUsers()
      // console.log(res);
    },
    dialogClose() {
      this.$refs.form.resetFields();
    },
    roleDialogclose() {
      this.roleid = ''
    }
  },
};
</script>

<style scoped>
.el-card {
  margin-top: 15px;
  box-shadow: none !important;
}
.el-pagination {
  margin-top: 15px;
}
</style>