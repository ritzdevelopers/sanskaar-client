import { Poppins, Lato, Quattrocento } from "next/font/google";
import Carrerbanner from "../components/carrer/carrerbanner";
import Carrerform from "../components/carrer/carrerform";
import Vaccancy from "../components/carrer/vaccancy";
import { FooterSection } from "../components/home/FooterSection";
import DreamHome from "../components/carrer/dreamhome";
import Testimonial from "../components/carrer/testimonial";
import Prrelease from "../components/carrer/prrelease";
export const metadata = {
  title: "Careers at Sanskar Realty | Real Estate Job Opportunities",
  description:
    "Kickstart your career at Sanskar Realty! Join us in real estate development and sales to build world-class properties. Apply now and create the extraordinary.",
  keywords: [
    "Sanskar Realty career",
    "real estate development jobs",
    "property development careers",
    "real estate sales careers",
    "careers at Sanskar Realty",
    "job opportunities in real estate",
    "apply for jobs in real estate",
    "property development professionals",
    "real estate career growth",
    "career in property development",
    "real estate job openings",
  ],
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

const quattrocento = Quattrocento({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-quattrocento",
});

export default function CarrerPage() {
  return (
    <main
      className={`${poppins.className} ${lato.variable} ${quattrocento.variable} w-full min-w-0 overflow-x-hidden`}
    >
      <Carrerbanner />
      <Carrerform />
      {/* <Vaccancy /> */}
      <DreamHome />
      <Testimonial />
      <Prrelease />
      <FooterSection alignWithHeader />
    </main>
  );
}
