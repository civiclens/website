const bgc = document.querySelector('.header');

window.addEventListener('scroll', () =>{
    if(window.scrollY >= 63){
        bgc.classList.add('bgch-scroll');
    }
    else if(window.scrollY < 63){
        bgc.classList.remove('bgch-scroll');
    }
});

var swiper = new Swiper(".mySwiper", {
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
    //   effect: "fade",
      speed: 1000,
    });


