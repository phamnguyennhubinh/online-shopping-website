<template>
  <div>
    <canvas id="myChart"></canvas>
    <br>
    <p>Doanh thu trong tuần: <strong>{{ formatVndCurrency(weeklyRevenue) }}</strong></p>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { AxiosInstance } from '@/helpers/request';

export default {
  name: 'OrderChart',
  props: ["orders"],
  data() {
    return {
      orders: [],
      chart: null,
      weeklyRevenue: 0,
    };
  },
  async mounted() {
    await this.getAllOrders();
    this.createChart();
    this.calculateWeeklyRevenue();
  },
  methods: {
    formatVndCurrency(amount) {
      // Format the amount with comma separated thousands
      let formattedAmount = Number(amount).toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&,');
      // Append 'đ' to indicate Vietnamese đồng
      formattedAmount += 'vnđ';
      return formattedAmount;
    },
    async getAllOrders() {
      try {
        const res = await AxiosInstance.get(`/order`);
        this.orders = res.data.result
      } catch (error) {
        console.log(error);
      }
    },
    getReadableStatus(status) {
      const statusOrderMapping = {
        'S4': 'Đơn hàng đang chờ giao',
        'S6': 'Đơn hàng đã giao',
        'S7': 'Đơn hàng đã huỷ'
      };
      return statusOrderMapping[status] || status;
    },
    isWithinThisWeek(date) {
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      const orderDate = new Date(date);

      return orderDate >= oneWeekAgo && orderDate <= now;
    },
    calculateWeeklyOrderStatus() {
      const result = {
        'Đơn hàng đang chờ giao': 0,
        'Đơn hàng đã giao': 0,
        'Đơn hàng đã huỷ': 0
      };

      this.orders.forEach(order => {
        // if (this.isWithinThisWeek(order.createdAt)) {
          
        // }
        const readableStatus = this.getReadableStatus(order.statusOrder);
          if (result[readableStatus] !== undefined) {
            result[readableStatus]++;
          }
      });

      return result;
    },
    createChart() {
      const weeklyOrderStatus = this.calculateWeeklyOrderStatus();
      console.log(weeklyOrderStatus)
      const ctx = document.getElementById('myChart').getContext('2d');

      // Đăng ký các thành phần cần thiết
      Chart.register(...registerables);

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(weeklyOrderStatus),
          datasets: [{
            label: 'Số lượng đơn hàng',
            data: Object.values(weeklyOrderStatus),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    calculateWeeklyRevenue() {
      let totalRevenue = 0;

      this.orders.forEach(order => {
        if (order.statusOrder === 'S6') {
          totalRevenue += order.totalPrice;
        }
      });

      this.weeklyRevenue = totalRevenue;
    },
  }
};
</script>

<style>
#myChart {
  width: 100%;
  height: 300px;
  max-width: 800px;
  max-height: 300px;
}
</style>