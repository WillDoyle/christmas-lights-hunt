import Image from "next/image";
import ChristmasLightsMap from "./components/ChristmasLights";
import candycaneGif from "@/public/candycaneline.gif"
export default function Home() {
  return <>
    <div className="min-h-screen w-full bg-[#f5f5f7] font-outfit">
      <Image src={candycaneGif} alt="alt" width={2000} height={10} />
      <ChristmasLightsMap></ChristmasLightsMap>
    </div>

  </>;
}
