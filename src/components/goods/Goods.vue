<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" clearable v-model="goodsParams.query" @input="getGoodsList">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="18">
          <el-button type="primary" clearable @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品表格 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="300px"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="180px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <!-- <el-table-column label="创建时间" prop="upd_time"></el-table-column> -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- <el-button type="primary" size="mini" @click="editGoods(scope.row)">修改</el-button> -->
            <el-button type="danger" size="mini" @click="delGoods(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsParams.pagenum"
        :page-sizes="[1, 4, 8, 10]"
        :page-size="goodsParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodsList();
  },
  data() {
    return {
      goodsParams: {
        query: "",
        pagenum: 1,
        pagesize: 4,
      },
      total: 0,
      // 获取商品列表
      goodsList: [],

    };
  },
  methods: {
    //获取商品信息
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.goodsParams,
      });
      if (res.meta.status !== 200) this.$message.error("获取商品列表失败");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      // this.$message.success('获取商品列表成功')
      console.log(this.goodsList);
    },
    handleSizeChange(newsize) {
      this.goodsParams.pagesize = newsize;
      this.getGoodsList();
    },
    handleCurrentChange(newpage) {
      this.goodsParams.pagenum = newpage;
      this.getGoodsList();
    },
    //添加商品
    addGoods() {
      this.$router.push("/goods/add");
    },
    //删除商品
    async delGoods(row) {
      console.log(row.goods_id);
      //根据商品id查询商品数据
      // const { data: res } = await this.$http.get(`goods/${row.goods_id}`);
      // if (res.meta.status !== 200) {
      //   this.$message.error("获取商品数据失败");
      // }
      // console.log(res);
      const confirmStr = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
         confirmButtonText: '确定',
         cancelButtonText: '取消',
         type: 'warning'
       }).catch(err=>err)
      if(confirmStr !== 'confirm'){
        return this.$message.info('你已取消了删除')
      }
      const {data: res} = await this.$http.delete(`goods/${row.goods_id}`)
      this.getGoodsList()
      this.$message.success('删除成功')

    },
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
.el-pagination {
  margin-top: 15px;
}
.el-tabs {
  margin-top: 30px;
}
.el-steps {
  width: 900px;
}
.el-alert {
  margin-bottom: 15px;
}
</style>