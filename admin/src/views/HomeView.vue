<template>
  <h3>Tổng quan</h3>
  <div class="wp">
    <div class="total">
      <span class="title">Total orders</span>
      <span>45</span>
    </div>
    <div class="total">
      <span class="title">Customers</span>
      <span>45</span>
    </div>
    <div class="total">
      <span class="title">Gross product</span>
      <span>45</span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.wp {
  display: flex;
  align-items: center;
}
.total {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 200px;
  border-radius: 12px;
  background-image: url("../assets/dispatch-bg.png");
  background-position: center;
  margin-right: 25px;
  > .title {
    font-size: 18px;
    color: #1675fc;
    font-weight: 600;
  }
  span {
    color: #262626;
    font-weight: 600;
  }
}
</style>
