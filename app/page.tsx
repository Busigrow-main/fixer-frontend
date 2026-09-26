import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import DifferenceSection from "@/app/components/DifferenceSection";
import HomeShopSection from "@/app/components/HomeShopSection";
import SocialProofSection from "@/app/components/SocialProofSection";
import InsuranceBanner from "@/app/components/InsuranceBanner";
import Footer from "@/app/components/Footer";
import ServicePickerSection from "@/app/components/ServicePickerSection";
import FloatingCallButton from "@/app/components/FloatingCallButton";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* pb-24 on mobile creates space above the fixed bottom nav bar */}
      <main className="pb-mobile-nav md:pb-0">
        <Hero />
        <ServicePickerSection />
        <DifferenceSection />
        <HomeShopSection />
        <InsuranceBanner />
        <SocialProofSection />
      </main>

      <Footer />

      {/* Floating call action */}
      <FloatingCallButton />
    </>
  );
}