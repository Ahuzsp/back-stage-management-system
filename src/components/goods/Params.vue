<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon title="只允许修改三级分类的参数" type="warning" :closable="false"></el-alert>
      <el-row class="choice">
        <el-col>
          <span>请选择分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="parentList"
            :props="cascaderProps"
            expandTrigger="hover"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 参数导航 -->
      <el-tabs v-model="activeName" @tab-click="handleTabChange">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                <!-- 可编辑标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="del(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
                 <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close='handleClose(i,scope.row)'>{{item}}</el-tag>
                <!-- 可编辑标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="del(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态属性，静态参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
      :close-on-click-modal="false"
    >
      <!-- 表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改动态属性，静态参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
      :close-on-click-modal="false"
    >
      <!-- 表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getParentList();
  },
  data() {
    return {
      selectedKeys: [],
      parentList: [],
      //级联选择框的配置
      cascaderProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      //被激活的标签页名
      activeName: "many",
      //动态参数数据
      manyTableData: [],
      //静态参数数据
      onlyTableData: [],
      //对话框默认隐藏
      addDialogVisible: false,
      //表单数据对象
      addForm: {
        attr_name: "",
      },
      //添加表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
      //修改对话框默认隐藏
      editDialogVisible: false,
      //修改参数的数据对象
      editForm: {},
      //修改表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    handleChange() {
      this.getParamsData();
    },
    async getParentList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 3 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类参数失败");
      }
      this.parentList = res.data;
      console.log(this.parentList);
    },
    handleTabChange() {
      console.log(this.activeName);
      this.getParamsData();
    },
    //获取参数列表
    async getParamsData() {
      //证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      console.log(this.selectedKeys);
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("请先选择三级分类");
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //为每一行的标签赋值
        item.inputVisible = false;
        item.inputValue = "";
      });
      console.log(res.data);
      if (this.activeName == "many") {
        this.manyTableData = res.data;
      }
      this.onlyTableData = res.data;
    },
    async addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败");
        }
        console.log(res.data);
        this.getParamsData();
        this.$message.success("添加成功");
        this.addDialogVisible = false;
      });
    },
    async editParams() {
      const {
        data: res,
      } = await this.$http.put(
        `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
        { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数失败");
      }
      this.$message.success("修改参数成功");
      console.log(res.data);
      this.getParamsData();
      this.editDialogVisible = false;
    },
    //展示修改对话框
    async showEditDialog(attr_id) {
      this.editDialogVisible = true;
      const {
        data: res,
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      } else {
        this.editForm = res.data;
        console.log(res);
      }
    },
    // 清空表单
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    async del(attr_id) {
      const confirmStr = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmStr !== "confirm") return this.$message.info("你已取消了删除");
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败");
      }
      this.$message.success("删除参数成功");
      console.log(res.data);
      this.getParamsData();
    },
    async handleInputConfirm(row) {
      if(row.inputValue.trim().length==0){
        row.inputValue = ''
        row.inputVisible = false
        return
       }
       row.attr_vals.push(row.inputValue.trim())
       row.inputValue = ''
       this.saveAttr(row)

    },
    // 保存修改的标签(数据库)
    async saveAttr(row) {
       const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
       {attr_name: row.attr_name, attr_sel: row.attr_sel,attr_vals:row.attr_vals.join(' ')})
       if(res.meta.status !==200){
         return this.$message.error('修改失败')
       }
       this.$message.success('修改参数成功')
       console.log(res);
        row.inputVisible = false
    },
    //控制输入框的显示与隐藏
    showInput(row) {
      row.inputVisible = true;
      //文本框自动获得焦点 $nextTick作用就是等待元素重新被渲染以后才调用
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //标签关闭处理函数
    handleClose(i,row) {
      row.attr_vals.splice(i,1)
      this.saveAttr(row)
    }
  },
  computed: {
    isDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true;
      }
      return false;
    },
    //选中的三级分类的id
    cateId() {
      if (this.selectedKeys.length == 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    titleText() {
      if (this.activeName == "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    },
  },
};
</script>

<style scoped>
.el-card {
  margin-top: 15px;
}
.choice {
  margin: 15px 0;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 5px 15px;
}
.input-new-tag {
  width: 120px !important;
}
</style>