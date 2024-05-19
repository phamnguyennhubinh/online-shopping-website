<template>
  <div class="backgr1">
    <a-carousel autoplay>
      <a-carousel-slide v-for="content in contents" :key="content.id">
        <div class="row">
          <div class="col-md-8 col-sm-12">
              <div class="position-welcome">
                <h1 class="title-welcome" v-html="content.title"></h1>
                <p class="para-welcome">{{ content.content }}</p>
                <button type="button" class="btn-welcome">CONTACT US</button>
              </div>
          </div>
          <div class="col-md-4 col-sm-12">
            <img :src="content.image" class="picture">
          </div>
        </div>
      </a-carousel-slide>
    </a-carousel>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { onMounted } from 'vue';
import { Carousel, CarouselSlide } from 'ant-design-vue';
// import { useCounterStore } from "@/stores/index";

export default defineComponent({
  props:{imageURL: String, },
  components: {
    'a-carousel': Carousel,
    'a-carousel-slide': CarouselSlide,
  },
  setup(){
    // const counterStore = useCounterStore();
    const contents = [
      {
        id: 1,
        title: 'Welcome To Our <br> B&H Shop',
        content: 'Chào mừng đến với cửa hàng trực tuyến của chúng tôi! Chúng tôi hân hạnh đồng hành cùng bạn trên hành trình thời trang trực tuyến của mình. Với một loạt các sản phẩm từ các nhãn hiệu uy tín và đa dạng các phong cách, chúng tôi tự tin rằng bạn sẽ tìm thấy những món đồ ưng ý và phản ánh phong cách riêng của mình.',
        image: 'https://png.pngtree.com/png-vector/20240206/ourmid/pngtree-male-model-striking-a-complete-posture-while-gazing-into-the-camera-png-image_11642547.png'
      },
      {
        id: 2,
        title: 'Welcome To Our <br> B&H Shop',
        content: 'Chúng tôi rất vui mừng khi chào đón bạn đến với cửa hàng trực tuyến của chúng tôi! Với sự chăm sóc kỹ lưỡng và sự đa dạng về sản phẩm, chúng tôi cam kết mang đến cho bạn trải nghiệm mua sắm trực tuyến tốt nhất. Hãy lựa chọn những món đồ ưng ý từ góc nhìn của bạn và để chúng tôi làm phần còn lại!', 
        image: 'https://png.pngtree.com/png-clipart/20240209/original/pngtree-bearded-male-model-striking-a-pose-in-a-fullbody-shot-against-png-image_14269646.png'
      },
      {
        id: 3,
        title: 'Welcome To Our <br> B&H Shop',
        conten: 'Tại cửa hàng trực tuyến của chúng tôi, việc mua sắm trở nên dễ dàng hơn bao giờ hết. Với sự tiện lợi của mua sắm từ nhà, bạn có thể khám phá bộ sưu tập đa dạng của chúng tôi mọi lúc, mọi nơi. Hãy thả mình vào thế giới thời trang trực tuyến của chúng tôi và tìm kiếm những sản phẩm phù hợp với phong cách của bạn!',
        image: 'https://png.pngtree.com/png-vector/20231116/ourmid/pngtree-relaxed-male-model-posing-with-tablet-computer-handsome-png-image_10566497.png'
      }
    ]
    onMounted(() => {
    });
    return {
      contents
    }
  }
});
</script>


<style lang="scss" scoped>
@import '@/style/styles.scss';
.row .col-sm-12 .img{
  vertical-align: middle;
}
.backgr1
{
  background-color: $backgr1;
	margin: 0 45px;
	border-radius: 0 0 15px 15px;
	padding:20px;
  .row
  {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
}
.title-welcome
{
	font-size: 56px;
	font-weight: bold;
	text-align: left;
	color: $font-color;
}
.para-welcome
{
	font-size: 18px;
	text-align: left;
	color: $font-color;
}
.position-welcome
{
	padding-left: 40px;
}
.btn-welcome
{
	background-color: $button;
	border: 1px solid $button;
	padding: 10px 40px;
	font-size: 16px;
	color: $font-color;
	border-radius: 5px;
	margin-top: 20px;
  &:hover
  {
    background-color: #f89cab;
    color: $button;
    border: 1px solid $button;
  }
}
.picture {
  object-fit: contain;
	text-align: center;
	vertical-align: middle;
  width: 100%;
  height: auto;
}
@media screen and (min-width: 740px) and (max-width: 1023px) {
  .title-welcome
{
	font-size: 40px;
}
.para-welcome
{
	font-size: 14px;
}
.btn-welcome
{
  margin-top: 10px;
  font-size: 12px;
}
.picture {
  width: 100%;
  height: 500px;
}
}
@media only screen and (max-width: 739px) {
  .title-welcome
{
	font-size: 40px;
}
  .picture {
  vertical-align: middle;
  width: 100%;
  height: 500px;
  padding-top: 20px;
}
}
@media  screen and (min-width: 375px) and (max-width: 811px) {
  .backgr1
{
	margin: 0;
  padding: 0;
}
.picture {
  width: 100%;
  height: 300px;
}
.title-welcome
{
	font-size: 30px;
}
.para-welcome {
  font-size: 16px;
}
.btn-welcome {
  font-size: 12px;
}
.position-welcome{
  padding-left: 0;
}
}

@media  screen and (max-width: 320px){
  .backgr1{
    margin: 0;
    .row {
      padding: 0;
    }
  }
  .col-md-8 {
    padding-left: 0;
  }
  .title-welcome {
    font-size: 27px;
  }
  .para-welcome {
     font-size: 15px;
  }
  .picture {
    height: 300px;
  }
  .btn-welcome{
    font-size: 15px;
    padding: 10px 20px;
    margin-left: 30px;
  }
  .position-welcome {
    padding-left: 0;
  }
}
// @media screen and (max-width: 250px) {
//   .position-welcome{
//     padding-left: 0;
//   }
// }
</style>
