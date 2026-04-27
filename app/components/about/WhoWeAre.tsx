"use client";

import Image from "next/image";
import { Lato, Quattrocento } from "next/font/google";
import { useRef, useState } from "react";
import { useScrollReveal } from "../common/useScrollReveal";
import { Mission } from "./Mission";

const lato = Lato({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal", "italic"],
});

const quattrocento = Quattrocento({
    subsets: ["latin"],
    weight: ["400", "700"],
});

export function WhoWeAre() {
    const sectionRef = useRef<HTMLElement>(null);
    const [showYoutubePlayer, setShowYoutubePlayer] = useState(false);

    useScrollReveal(sectionRef);

    const handlePlayClick = () => {
        setShowYoutubePlayer(true);
    };

    return (
        <section ref={sectionRef} className="relative w-full min-w-0 overflow-x-hidden pt-[35px]  bg-[#FAFAFA] lg:pt-[75px] ">
            {/* Subtle two-tone background to match the split look */}
            <div className="absolute inset-x-0 top-0 lg:h-[30%] -z-20 md:h-[28%]  h-[32%]" />
            <div className="absolute inset-x-0 bottom-0 h-[50%] lg:h-[45%] bg-white -z-20" />

            <div className="relative z-10 mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 flex flex-col items-center">

                {/* Header Text */}
                <div data-scroll-reveal className="text-center mb-6 md:mb-10 w-full">
                    <p className={`${lato.className} text-[#4A4A4A] text-[15px] font-medium sm:text-[16px] mb-3 md:mb-4`}>
                        Who We Are
                    </p>
                    <h2 className={`${quattrocento.className} text-[20px] md:text-[26px] leading-[1.2] text-[#111111] uppercase sm:text-[32px] md:text-[36px] lg:text-[40px] xl:text-[42px]`}>
                    Creating Spaces That Inspire Modern Living
                    </h2>
                </div>

                {/* Description Paragraphs */}
                <div data-scroll-reveal className={`mx-auto mb-10 w-full max-w-[1040px] space-y-2 text-center align-middle text-[#666666] sm:mb-12 md:mb-16 md:space-y-2 ${lato.className} text-[15px] leading-[26px] sm:text-[17px] sm:leading-[30px] md:text-[18px] md:leading-[32px] tracking-normal`}>
                    {/* <p>
                        Sanskar Realty is not merely another name in the overcrowded Delhi NCR real estate market. We are the real estate venture of <span className="text-[#F7A51D] font-bold">the Yatharth Family Office</span> – which is the strategic investment branch of <span className="text-[#F7A51D] font-bold">Yatharth Group</span> and <span className="text-[#F7A51D] font-bold">North India's third largest public-listed healthcare company</span> founded in 2008 and relied on by millions throughout the area.
                    </p> */}

                    <p>Sanskar Realty, a leading real estate developer in <span className="text-[#F7A51D] font-bold"> Delhi NCR</span>, dedicated to delivering quality and thoughtfully designed homes that fit modern living standards. With over  17 years of trusted legacy through our other ventures , we have been crafting <span className="text-[#F7A51D] font-bold"> residential and commercial spaces </span> emphasizing trust, integrity and quality that holds lasting value and comfort.</p>
                    {/* <p>
                        The same values that built one of India's most respected hospital networks — <span className="text-[#F7A51D] font-bold">care, integrity, transparency,</span> and a <span className="text-[#F7A51D] font-bold">commitment</span> to human wellbeing — now shape every residential community we create. The product of a healthcare pioneer building homes is no ordinary real estate. Security, dignity, and value per square foot are the measured outcomes of the sanctuary.
                    </p> */}
                    <p>Our portfolio encompasses <span className="text-[#F7A51D] font-bold"> Noida Extension, Greater Noida West </span> and <span className="text-[#F7A51D] font-bold"> Ghaziabad</span>  , with projects that offer prime location, world-class  amenities and innovative designs. Our premium  spacious  3 & 4 BHK apartments, studio homes, and  gated villas are designed to enhance your lifestyle through effortless living, socializing, and health.
                    </p>
                    {/* <p className="mx-auto w-full max-w-[1000px]">
                        Sanskar Realty has been excelling in delivering top-notch projects in <span className="text-[#F7A51D] font-bold">Noida Extension, Greater Noida West</span>, and <span className="text-[#F7A51D] font-bold">Ghaziabad</span> for over 17 years, constantly reshaping the standards of luxury lifestyle in Delhi NCR, one meticulously designed home at a time.
                    </p> */}
                    <p>At Sanskar Realty, we always consider a home as an investment for the future and not just a living space. Our homes are made to appreciate over time, offering comfort, safety, and a legacy for future generations to enjoy.</p>
                </div>

                {/* Video Container */}
                {/* <div data-scroll-reveal className="relative w-full max-w-[1024px] aspect-video rounded-[12px] overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.08)] bg-black/5 mx-auto border border-black/5">
                    {!showYoutubePlayer ? (
                        <button
                            type="button"
                            onClick={handlePlayClick}
                            className="absolute inset-0 w-full h-full cursor-pointer"
                            aria-label="Play company video"
                        >
                            <Image
                                src="https://img.youtube.com/vi/P21m5c6PUH8/maxresdefault.jpg"
                                alt="Watch Sanskar Realty video"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-all duration-300 hover:bg-black/20">
                                <div className="flex items-center justify-center w-[96px] h-[96px] rounded-full bg-[rgba(255,255,255,0.8)] drop-shadow-xl transition-transform duration-300 hover:scale-[1.05]">
                                    <Image
                                        src="/assets/play_button.svg"
                                        alt="Play Video"
                                        width={40}
                                        height={40}
                                        className="w-[35px] h-[35px] object-contain translate-x-1"
                                    />
                                </div>
                            </div>
                        </button>
                    ) : (
                        <iframe
                            className="absolute inset-0 h-full w-full"
                            src="https://www.youtube.com/embed/P21m5c6PUH8?autoplay=1&rel=0"
                            title="Sanskar Realty video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                    )}
                </div> */}

                {/* Bottom Subtitle text */}
                {/* <p data-scroll-reveal className={`${lato.className} italic font-normal text-[14px] leading-[21px] tracking-normal text-center align-middle capitalize text-[#00000099] mt-6 md:mt-8 max-w-[600px]`}>
                    Hospital Yatharth Group Support – Yatharth Group of Hospitals – 8 Hospitals and 2,500+ Beds – NABH Accredited – 4 States
                </p> */}

                

            </div>
        </section>
    );
}
