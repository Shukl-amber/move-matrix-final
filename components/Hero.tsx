import { FaLocationArrow } from "react-icons/fa6";

import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative min-h-screen pb-20 pt-36 bg-[#000319]" id="home">
      {/* Spotlights */}
      <div className="absolute inset-0">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        <Spotlight
          className="-top-40 right-0 md:right-60 md:-top-20"
          fill="purple"
        />
        <Spotlight className="left-1/2 top-1/2 h-[80vh] w-[50vw]" fill="blue" />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[#000319] bg-grid-white/[0.02] flex items-center justify-center">
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center bg-[#000319]
         [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center mt-32">
        <div className="text-center">
          <p className="uppercase tracking-widest text-xs text-white/60 mb-4">
            MOVEMATRIX
          </p>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-8 max-w-4xl mx-auto">
            Build DeFi Visually
          </h1>

          <p className="text-white/60 mb-12 text-base md:text-lg lg:text-xl max-w-[90%] md:max-w-[80%] mx-auto">
            MoveMatrix helps you compose DeFi primitives and generate production-ready Move code for the Aptos blockchain
          </p>

          <Link href="/dashboard">
            <MagicButton
              title="Try It Now"
              icon={<FaLocationArrow />}
              position="right"
              otherClasses="px-8 py-4 text-base"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
