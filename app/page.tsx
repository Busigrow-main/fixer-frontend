import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import DifferenceSection from "@/app/components/DifferenceSection";
import AppliancesSection from "@/app/components/AppliancesSection";
import SocialProofSection from "@/app/components/SocialProofSection";
import InsuranceBanner from "@/app/components/InsuranceBanner";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      {/* pb-24 on mobile creates space above the fixed bottom nav bar */}
      <main className="pb-24 md:pb-0">
        <Hero />
        <DifferenceSection />
        <InsuranceBanner />
        <AppliancesSection />
        <SocialProofSection />
      </main>
      <Footer />
    </>
  );
}
