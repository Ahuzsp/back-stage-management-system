<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input  v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status=='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAdd"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="handleClose" :close-on-click-modal="false">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="省市区" prop="address">
            <el-cascader v-model="editForm.address" 
            :options="cityData" 
            expandTrigger="hover"
            @change="handleChange"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="detailAdd">
            <el-input v-model="editForm.detailAdd"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleEdit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 显示物流对话框 -->
      <el-dialog title="查看物流" :visible.sync="progressDialogVisible" width="50%" :close-on-click-modal="false">
        <!-- 时间线 -->
        <el-timeline :reverse="false">
          <el-timeline-item
            v-for="(activity, index) in logisticsInfo"
            :key="index"
            :timestamp="activity.ftime"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
        <span slot="footer" class="dialog-footer">
          <el-button @click="progressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from "./citydata.js";
export default {
  created() {
    this.getOrdersList();
  },
  data() {
    return {
      ordersList: [],
      //获取订单列表的参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      //修改地址对话框
      editDialogVisible: false,
      //表单输入框验证
      editForm: {
        detailAdd: "",
        address: [],
      },
      editFormRules: {
        detailAdd: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
        address: [{ required: true, message: "请选择地址", trigger: "blur" }],
      },
      cityData,
      //物流对话框
      progressDialogVisible: false,
      //物流信息数组
      logisticsInfo: [],
    };
  },
  methods: {
    //获取订单列表
    async getOrdersList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }
      this.ordersList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getOrdersList();
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getOrdersList();
    },
    //修改地址
    editAdd() {
      this.editDialogVisible = true;
    },
    //关闭对话框清空表单内容
    handleClose() {
      this.$refs.editFormRef.resetFields();
    },
    async showProgressBox() {
      this.progressDialogVisible = true;
      const { data: res } = await this.$http.get("kuaidi/1106975712662");
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流信息失败");
      }
      this.logisticsInfo = res.data;
      console.log(this.logisticsInfo);

    },
    //监听级联选择框中地址的改变
    handleChange() {
      console.log(this.editForm.address);
    },
    //提交修改后的数据
    handleEdit() {
      this.ordersList.consignee_addr=this.editForm.address.join('-')+'-'+
      this.editForm.detailAdd
      console.log(this.ordersList.consignee_addr);
      this.editDialogVisible=false
    }
  },
};
</script>

<style scoped>
.el-card {
  margin-top: 15px;
  box-shadow: none !important ;
}
.el-cascader {
  width: 100%;
}
.el-table {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>