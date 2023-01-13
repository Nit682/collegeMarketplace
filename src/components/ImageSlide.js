import React from 'react'
// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

//link to swiper react: https://swiperjs.com/react

function ImageSlide(props) {
    return (
        <Swiper
            // install Swiper modules
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            loop={true}
            autoplay={
            {
                delay:3000,
                disableOnInteraction: false
            }
            }
        >

            {
                props.data.map(url => {
                    return(
                        <SwiperSlide>
                            <div className='z-0 mt-[1vh] h-[40vh] flex justify-center'>
                                <img src={url} className='h-[40vh] object-contain' alt='' />
                            </div>
                        </SwiperSlide>  
                    )
                })
            }
          
        </Swiper>
    );
}

export default ImageSlide