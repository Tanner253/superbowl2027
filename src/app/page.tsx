import { Announcement, BuyBand } from "@/components/home/Bands";
import ConferenceBar from "@/components/home/ConferenceBar";
import EngineSteps from "@/components/home/EngineSteps";
import Hero from "@/components/home/Hero";
import Movers from "@/components/home/Movers";
import Pairing from "@/components/home/Pairing";
import Ticker from "@/components/home/Ticker";
import TitleFavorites from "@/components/home/TitleFavorites";

export default function Home() {
  return (
    <>
      <Hero />
      <BuyBand />
      <Ticker />
      <ConferenceBar />
      <EngineSteps />
      <Pairing />
      <Announcement />
      <Movers />
      <TitleFavorites />
    </>
  );
}
