<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row class="addsort">
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        border
        show-index
        index-text="#"
      >
        <!-- 是否有效 -->
        <template slot="deleted" slot-scope="scope">
          <i v-if="scope.row.cat_deleted==false" class="el-icon-success" style="color: lightgreen;"></i>
          <i v-else class="el-icon-error" style="color: red;"></i>
        </template>
        <template slot="level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level==0" type="primary">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level==1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" @click="editCate(scope.row)">修改</el-button>
          <el-button type="danger" size="mini" @click="delCate(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="cateInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="cateInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addDialogVisible"
        width="30%"
        @closed="addDialogVisibleClose"
        :close-on-click-modal="false"
      >
        <el-form ref="addCateInfoRef" :rules="rules" :model="addCateInfo" label-position="left">
          <el-form-item label="分类名称:" prop="cat_name" label-width="100px">
            <el-input clearable placeholder="请输入分类名称" width="50%" v-model="addCateInfo.cat_name"></el-input>
          </el-form-item>
          <!-- 级联选择框 -->
          <el-form-item label="父级分类" label-width="100px">
            <el-cascader
              :props="cascaderProps"
              :options="parentList"
              expandTrigger="hover"
              clearable
              v-model="selectedKeys"
              @change="parentCateChanged()"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑商品对话框 -->
      <el-dialog
  title="提示"
  :visible.sync="editDialogVisible"
  width="50%"
  :close-on-click-modal="false"
  >
  <el-form ref="editCateListRef" :rules="editCateListRules" :model="editCateList" label-width="100px">
    <el-form-item label="商品id">
      <el-input v-model="editCateList.cat_id" disabled></el-input>
    </el-form-item>
    <el-form-item label="商品名称" prop="cat_name">
      <el-input v-model="editCateList.cat_name"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="handleEdit">确 定</el-button>
  </span>
</el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getCategories();
  },
  data() {
    return {
      cateList: [],
      //选中的元素ID值
      selectedKeys: [],
      columns: [
        { label: "商品名", prop: "cat_name" },
        { label: "是否有效", type: "template", template: "deleted" },
        { label: "排序", type: "template", template: "level" },
        { label: "操作", type: "template", template: "opt" },
      ],
      //查询参数
      cateInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      //添加分类对话框
      addDialogVisible: false,
      rules: {
        cat_name: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
      },
      // 所有二级分类的数据列表
      parentList: [],
      //级联选择框配置
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //请求接口时需要传递的参数
      addCateInfo: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      //编辑提交时所传的参数
      editCateList: {
        cat_id: '',
        cat_name: '',
      },
      //编辑商品对话框
      editDialogVisible: false,
      editCateListRules:{
        cat_name:[{
          required: true, message:'请输入商品名称',trigger: 'blur'
        }]
      }
    };
  },
  methods: {
    async getCategories() {
      const { data: res } = await this.$http.get("categories", {
        params: this.cateInfo,
      });
      //   console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类信息失败");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      //   this.$message.success('获取分类信息成功')
    },
    //获取当前页
    handleCurrentChange(newpage) {
      this.cateInfo.pagenum = newpage;
      this.getCategories();
    },
    //每页数量
    handleSizeChange(newsize) {
      this.cateInfo.pagesize = newsize;
      this.getCategories();
    },
    //找出所有的二级分类
    async addCate() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      console.log(res);
      if (res.meta.status !== 200) return;
      this.parentList = res.data;
      this.addDialogVisible = true;
    },
    //判断是否选择一级菜单
    parentCateChanged() {
      console.log(this.selectedKeys);
      if (this.selectedKeys.length !== 0) {
        //选中了父级元素
        this.addCateInfo.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateInfo.cat_level = this.selectedKeys.length;
      } else {
        this.addCateInfo.cat_pid = 0;
        this.addCateInfo.cat_level = 0;
      }
    },
    submit() {
      this.$refs.addCateInfoRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateInfo
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }

        this.$message.success("添加分类成功！");
        this.getCategories();
        this.addDialogVisible = false;
      });
    },
    addDialogVisibleClose() {
      this.$refs.addCateInfoRef.resetFields();
      this.selectedKeys = [];
      this.addCateInfo.cat_level = 0;
      this.addCateInfo.cat_id = 0;
    },
    //删除分类
    async delCate(row) {
      // console.log(row.cat_id);

      //消息提示框
       let confirmStr = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch(err => err);
      if (confirmStr !== "confirm") {
        return this.$message.info("你已取消了删除");
      }
      const { data: res } = await this.$http.delete(`categories/${row.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getCategories();
    },
    //编辑提交分类
    async editCate(row) {
      this.editDialogVisible = true
    //应该先根据ID获取所对应的数据
      const {data: res} = await this.$http.get(`categories/${row.cat_id}`)
      console.log(res);
      this.editCateList.cat_name = res.data.cat_name
      this.editCateList.cat_id = res.data.cat_id
      // const {data: res} = await this.$http.put(`categories/${row.cat_id}`,{cat_name:this.cat_name})
      // console.log(res);
    },
    async handleEdit(){
      const {data: res} = await this.$http.put(`categories/${this.editCateList.cat_id}`
      ,{cat_name:this.editCateList.cat_name})
      if(res.meta.status !== 200) {
        return this.$message.error('更新数据失败')
      }
      this.getCategories()
      this.editDialogVisible = false
      this.$message.success('更新数据成功')
    }

  },
};
</script>

<style scoped>
.el-card {
  margin-top: 15px;
}
.addsort {
  margin-bottom: 15px;
}
.el-pagination {
  margin-top: 15px;
}
.el-popper {
  height: 300px;
}
</style>