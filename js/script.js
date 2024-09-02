'use strict';
// PARALLAX EFFECT
/*
function parallaxHeader() {
	// let parallax = document.querySelector('.hdr-bg');
	let parallax = document.querySelector('#hdr-bg-img');
	function scrollParallax() {
		let scrollTop = document.documentElement.scrollTop;
		parallax.style.transform = 'translateY(' + scrollTop * -0.05 + 'px)';
		// parallax.style += 'transition: all 0.5s';
	}
	window.addEventListener('scroll', scrollParallax);
}
*/
// STICKY MENU
function stickyMenu() {
	const stickyBar = document.querySelector('.hdr-top-mn');
	let heightBar = stickyBar.offsetHeight;
	// NAVBAR HEADER TEXT EFFECT
	const mnTxt1 = document.querySelectorAll('.mn-txt-1');
	const hdrTtl = document.querySelector("#hdr-ttl");
	// EVENT ACTION
	window.addEventListener('scroll', function() {
		if ((window.pageYOffset-100)  > heightBar) {
			// NAVBAR HEADER
			stickyBar.classList.add('stickyBar');
			// NAVNAR HEADER TEXT CLASS
			// mnTxt1.forEach(function(element){console.log(element)});
			// mnTxt1.forEach((element)=>(console.log(element)));
			mnTxt1.forEach((element) => (element.classList.add('chng-c-1')));
			hdrTtl.classList.add('chng-c-1');
		} else {
			stickyBar.classList.remove('stickyBar');
			mnTxt1.forEach((element) => (element.classList.remove('chng-c-1')));
			hdrTtl.classList.remove('chng-c-1');
		}
	})
} stickyMenu();
// SLIDES
function slidesHeader() {
	let slideIndex = 0;
	showSlides();
	function showSlides() {
		let i;
		// let slides = document.getElementsByClassName("mySlides");
		let slides = document.querySelectorAll('.hdr-bnnr-msg');
		for (i = 0; i < slides.length; i++) {
			slides[i].style.display = "none";
		}
		slideIndex++;
		if (slideIndex > slides.length) {slideIndex = 1}
			slides[slideIndex-1].style.display = "block";
			setTimeout(showSlides, 15000); // CHANGE IMAGE EVERY...
	}
} slidesHeader();
// MAIN TITLE
function mainTitle() {
	let span = document.querySelectorAll('.main-ttl > h2 > span');
	let p = document.querySelector('.main-ttl > p');
	function show(element) {
		element.style.opacity = 1;
	}
	setTimeout(show, 1000, span[0]);
	setTimeout(show, 1700, span[1]);
	setTimeout(show, 2400, span[2]);
	setTimeout(show, 3000, p);
} // mainTitle();
// SWIPER
const swiper = new Swiper('.slider-wrapper', {
	// OPTIONAL PARAMETERS
	slidesPerView: 3,
	loop: true,
	grabCursor: true,
	// spaceBetween: 30,
	spaceBetween: 35,
	// PAGINATION
	pagination: {
  		el: '.swiper-pagination',
  		clickable: true,
  		dynamicBullets: true
	},
	// NAVIGATION ARROWS
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	// RESPONSIVE BREAKPOINTS
	breakpoints: {
		0: {
			slidesPerView: 1
		},
		768: {
			slidesPerView: 2
		},
		1024: {
			slidesPerView: 3
		},
		2400: {
			slidesPerView: 3
		}
	}
});