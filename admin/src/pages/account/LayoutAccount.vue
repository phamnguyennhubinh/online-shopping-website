<template>
  <div class="bg">
    <div class="container">
      <div class="row">
        <div class="">
          <router-view />
        </div>
      </div>
    </div>
  </div>

</template>
<style lang="scss">
  .bg {
    background-image: url('../../assets/bg.jpg');
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
  }
  .login-form {
    padding: 20px;
    border-radius: 12px;
    background-color: #F2F4F5;
    max-width: 500px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
  }
</style>