"use client";



import Image from "next/image";

import { Lato, Quattrocento } from "next/font/google";

import { useRef } from "react";

import {

  ABOUT_SANSKAR_GROUP_INTRO_ID,

  ABOUT_SANSKAR_GROUP_SECTION_ID,

} from "../common/aboutNavigation";

import { useScrollReveal } from "../common/useScrollReveal";



const lato = Lato({

    subsets: ["latin"],

    weight: ["400", "700"],

});



const quattrocento = Quattrocento({

    subsets: ["latin"],

    weight: ["400", "700"],

});



export function AboutSanskarGroup() {

    const sectionRef = useRef<HTMLElement>(null);

    useScrollReveal(sectionRef);



    return (

        <section

            id={ABOUT_SANSKAR_GROUP_SECTION_ID}

            ref={sectionRef}

            className="relative w-full scroll-mt-[100px] bg-white py-[35px] lg:pt-[70px]"

            style={{

                backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",

                backgroundSize: "24px 24px",

            }}

        >

            <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">

                <div className="mx-auto flex w-full max-w-[1280px] flex-col xl:max-w-[1320px]">



                    {/* Header Part — deep link / Our Profile scroll target */}

                    <div

                        id={ABOUT_SANSKAR_GROUP_INTRO_ID}

                        data-scroll-reveal

                        className="w-full scroll-mt-[100px] text-center lg:text-left mb-10 md:mb-[50px]"

                    >

                        <p className={`${lato.className} mb-4 text-[#4A4A4A] text-[15px] font-medium sm:text-[16px] md:text-[18px]`}>

                            About Sanskar Group

                        </p>

                        <h2 className={`${quattrocento.className} text-[20px] md:text-[26px] leading-[1.2] text-[#111111] uppercase sm:text-[32px] md:text-[36px] lg:text-[40px] xl:text-[46px]`}>

                            BUILDING TRUST. CREATING VALUE. DELIVERING RESULTS.

                        </h2>

                    </div>



                    {/* Columns */}

                    <div className="rounded-xl bg-[whitesmoke] p-5 sm:p-7 lg:p-8">

  <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-8">

    

    {/* Left Column (Image & Name) */}

    <div

      data-scroll-reveal

      className="flex w-full shrink-0 flex-col items-center lg:w-[280px] lg:max-w-[280px]"

    >

      <div className="relative mb-4 h-[230px] w-full max-w-[250px] overflow-hidden rounded-2xl">

        <Image

          src="/assets/founder2.png"

          alt="Owner Name - Chairman and Managing Director"

          fill

          sizes="(max-width: 768px) 250px, 250px"

          className="object-cover"

        />

      </div>



      <h3 className={`${lato.className} text-center text-[19px] font-semibold text-[#111111]`}>

      Mr. Sanskar Tyagi

      </h3>

      <p className={`${lato.className} mt-1 text-center text-[18px] font-normal text-[#4f4f4f]`}>

         Director

      </p>

    </div>



    {/* Right Column (Text Content) */}

    <div

                                data-scroll-reveal

                                className={`flex flex-1 flex-col gap-1 lg:mt-4 mt-0 lg:text-[16px] xl:text-[17px] text-center lg:text-left ${lato.className} text-[17px] md:leading-[1.65] leading-[1.5] text-[#555555]`}

                            >

                                <p>

                                <span className="font-bold text-[#F7A51D]">  Mr. Sanskar Tyagi</span>, an alumnus of <i>University College London (UCL)</i>, holds a graduate degree in Management and Finance and brings a fresh, data-driven perspective to Sanskar Realty. He combines his financial expertise with strong real estate insight to guide the company's strategic direction and growth.



He focuses on aligning financial planning with development, ensuring each project delivers long-term value. His vision is to enhance the potential of every asset while creating sustainable, profitable outcomes and building lasting client relationships.



                                </p>

                                {/* <p className="md:mt-0 mt-2">

                                With over 17 years of legacy, we are committed to delivering <span className="font-bold text-[#F7A51D]"> landmarks residential</span> and <span className="font-bold text-[#F7A51D]"> commercial spaces</span>, reshaping the real estate landscape. Our vision is to create sustainable, value-driven developments enhancing the quality of life in every community we serve.



                                </p>

                                <p className="md:mt-0 mt-2">

                                As we move forward, our aim is to set new benchmarks in the real estate industry while fostering trust and building long-term relationships with our clients.

                                </p> */}

                            </div>



  </div>

</div>

                    <div className="rounded-xl mt-9 p-5 sm:p-7 lg:p-8">

                        <div className="flex flex-col items-center gap-6 lg:flex-row-reverse lg:items-start lg:gap-8">

                            {/* Right Column (Image & Name) */}

                            <div data-scroll-reveal className="flex w-full shrink-0 flex-col items-center lg:w-[280px] lg:max-w-[280px]">

                                <div className="relative mb-4 h-[230px] w-full max-w-[250px] overflow-hidden rounded-2xl">

                                <Image

                                    src="/varun/kuldeeptyagipro.jpg"

                                    alt="Owner Name - Chairman and Managing Director"

                                    fill

                                    sizes="(max-width: 768px) 250px, 250px"

                                    className="object-cover"

                                />

                            </div>

                                <h3 className={`${lato.className} text-center text-[19px] font-semibold text-[#111111]`}>

                                    Mr.Kuldeep Tyagi

                                </h3>

                                <p className={`${lato.className} mt-1 text-center text-[18px] font-normal text-[#4f4f4f]`}>

                                   Director

                                </p>

                            </div>



                            {/* Left Column (Text Content) */}

                            <div

                                data-scroll-reveal

                                className={`flex flex-1 flex-col gap-1 lg:mt-4 mt-0 lg:text-[16px] xl:text-[17px] text-center lg:text-left ${lato.className} text-[17px] md:leading-[1.65] leading-[1.5] text-[#555555]`}

                            >

                                <p>

                               <span className="font-bold text-[#F7A51D]"> Mr. Kuldeep Tyagi</span> is a dynamic real estate leader with over 21 years of hands-on experience across the Delhi NCR market. Armed with a B.Tech and MBA, he combines technical expertise with sharp business acumen to drive results in both commercial and residential real estate.

Known for his strong sales instinct and relationship-driven approach, he has built an extensive network that fuels growth opportunities and strategic partnerships. His deep understanding of land acquisition, joint ventures, and project development enables him to identify value and unlock potential in every deal.

At the core of his work is a forward-thinking mindset, focused on <i>innovation</i>, <i>scalability</i>, and delivering <i> impactful real estate solutions</i>.



                                </p>

                                {/* <p className="md:mt-0 mt-2">

                                With over 17 years of legacy, we are committed to delivering <span className="font-bold text-[#F7A51D]"> landmarks residential</span> and <span className="font-bold text-[#F7A51D]"> commercial spaces</span>, reshaping the real estate landscape. Our vision is to create sustainable, value-driven developments enhancing the quality of life in every community we serve.



                                </p>

                                <p className="md:mt-0 mt-2">

                                As we move forward, our aim is to set new benchmarks in the real estate industry while fostering trust and building long-term relationships with our clients.

                                </p> */}

                            </div>

                        </div>

                    </div>



                </div>

            </div>

        </section>

    );

}


