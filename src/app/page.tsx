import { Announcement, BuyBand } from "@/components/home/Bands";
import EngineSteps from "@/components/home/EngineSteps";
import FrontrunnerRace from "@/components/home/FrontrunnerRace";
import Hero from "@/components/home/Hero";
import Movers from "@/components/home/Movers";
import Pairing from "@/components/home/Pairing";
import Chyron from "@/components/home/Chyron";
import RaceTo270 from "@/components/home/RaceTo270";

export default function Home() {
  return (
    <>
      <Hero />
      <BuyBand />
      <Chyron />
      <RaceTo270 />
      <EngineSteps />
      <Pairing />
      <Announcement />
      <Movers />
      <FrontrunnerRace />
    </>
  );
}
