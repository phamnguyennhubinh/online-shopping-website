<template>
	<div class="backgr3" @click="handleProductClick">
		<div class="new">New</div>
		<center><img :src="pic" class="picture-products"></center>
		<div class="space font-products">
			<div class="display-inline">{{ name }}</div>
			<div class="display-inline"><span class="price-color">{{ price }}</span></div>
		</div>
	</div>
</template>

<script>
export default {
  props: ['id','pic','name', 'price'],
  data(){
    return {
      
    }
  },
  methods: {
	handleProductClick() {
		this.$emit('productClick',this.$props.id);
	}
  }
}
</script>

<style>
.heading-product
{
	font-family: "poppins", sans-serif;
	font-weight: bold;
	font-size: 28px;
	text-align: center;
	margin-top: 80px;
	margin-bottom: 50px;
}
.backgr3 
{
	background-color: #eeeeee;
	padding: 10px;
}
.new
{
	background-color: white;
	border-radius: 100%;
	width: 50px;
	height: 50px;
	padding-top: 10px;
	padding-left: 10px;
}
.picture-products
{
	object-fit: fill;
	padding: 20px;
	max-height: 180px;
	width: auto;
}
.space
{
	display: flex;
	justify-content: space-between;
}
.font-products
{
	font-weight: bold;
	margin-top: 10px;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.display-inline
{
	display: inline-block;
}
.price-color
{
	color: #db4f66;
}
.space-col
{
    padding-top: 25px;
}
.btn-view-products
{
	background-color: #f16179;
	border: 1px solid #f16179;
	padding: 10px 40px;
	font-size: 16px;
	color: white;
	border-radius: 5px;
	margin-top: 30px;
}
.padding-row {
    padding-bottom: 30px;
}
</style>