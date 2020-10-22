<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name" width="300px"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price" width="300px"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight" width="300px"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number" width="300px"></el-input>
            </el-form-item>
            <el-form-item label="选择参数" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :props="cateProps"
                :options="cateList"
                expandTrigger="hover"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item1" v-for="(item1, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headersObj"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoods" class="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片展示对话框 -->
    <el-dialog title="图片预览" :visible.sync="imgDialogVisible" width="50%">
      <img :src="previewPath" style="width:100%">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  created() {
    this.getCateList();
  },
  data() {
    return {
      activeIndex: "0",
      //添加商品的表单数据
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        //上传图片路径
        pics: [],
        //图片描述
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择分类参数", trigger: "blur" },
        ],
      },
      // 分类参数的列表
      cateList: [],
      //级联选择框的配置
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      //动态参数列表数据
      manyTableData: [],
      //静态属性列表数据
      onlyTableData: [],
      //为上传图片指定Authorization请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //图片的真实路径
      previewPath: "",
      imgDialogVisible: false
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.console.error("获取参数失败");
      }
      // console.log(res.data);
      this.cateList = res.data;
    },
    //级联选择框中选中参数发生改变时的处理函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return;
      }
      console.log(this.addForm.goods_cat);
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(activeName,oldActiveName);
      if (oldActiveName == "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择三级分类");
        return false;
      }
    },
    //点击tab栏时发生的跳转
    async tabClicked() {
      console.log(this.activeIndex);
      //当选中第二行的时候调用接口获取参数
      if (this.activeIndex == "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败");
        }
        // console.log(res.data);
        res.data.forEach((element) => {
          element.attr_vals =
            element.attr_vals.length == 0 ? [] : element.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
      } else if (this.activeIndex == "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败");
        }
        this.onlyTableData = res.data;
        console.log(this.onlyTableData);
      }
    },
    //处理图片预览
    handlePreview(file) {
      this.imgDialogVisible = true
      this.previewPath = file.response.data.url;
    },
    // 处理图片移除操作
    handleRemove(file) {
      const fileTmpPath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic == fileTmpPath);
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    handleSuccess(response) {
      console.log(response);
      //拼接得到一个信息图片对象
      const picInfo = { pic: response.data.tmp_path };
      //将该对象加到pics中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm.pics);
    },
    addGoods(){
      this.$refs.addFormRef.validate(async valid =>{
        if(!valid) return this.$message.error('请填写必要的表单项')
      
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')
      //动态参数
      this.manyTableData.forEach(item=>{
        let newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(newInfo)
      })
      //静态属性
      this.onlyTableData.forEach(item=>{
        let newInfo = {
          attr_id: item.attr_id,
          attr_value:item.attr_vals
        }
        this.addForm.attrs.push(newInfo)
      })
      form.attrs = this.addForm.attrs
      console.log(form);
      //调用接口，实现添加商品的操作
      const {data: res} = await this.$http.post('goods',form)
      if(res.meta.status !== 201){
        return this.$message.error('添加商品失败')
      }
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
    })
      
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style scoped>
.el-card {
  margin-top: 15px;
  box-shadow: none !important;
}
.el-alert {
  margin: 15px 0;
}
.el-tabs {
  margin: 30px 0;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.addGoods {
  margin-top: 15px
}

</style>