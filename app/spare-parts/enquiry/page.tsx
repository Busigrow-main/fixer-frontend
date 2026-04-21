import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SparePartsEnquiryForm from "@/app/components/SparePartsEnquiryForm";

export default async function SparePartsEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ part?: string }>;
}) {
  const params = await searchParams;
  const selectedPartId = params.part ?? "";

  // Fetch all spare parts from the backend API
  let spareParts = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/spare-parts`,
      {
        cache: "no-store",
      },
    );
    if (res.ok) {
      const json = await res.json();
      spareParts = Array.isArray(json) ? json : json.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch spare parts:", error);
  }

  // Find if there's a pre-selected part
  const selectedPart = Array.isArray(spareParts)
    ? spareParts.find((p: any) => p._id === selectedPartId)
    : null;

  return (
    <>
      <Navbar />
      <main className="pt-4 md:pt-20 pb-20 bg-surface min-h-screen">
        <section className="container mx-auto px-6 md:px-10 max-w-screen-xl pt-0 md:pt-2">
          <div className="max-w-3xl mx-auto bg-white border border-outline rounded-3xl p-6 md:p-10 shadow-xl shadow-black/5">
            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-primary">
              Quick Buy / Enquiry
            </p>
            <h1 className="mt-3 font-headline text-3xl md:text-5xl text-on-surface tracking-tight">
              Request Spare Parts
            </h1>
            <p className="mt-3 text-sm md:text-base text-on-surface-variant">
              {selectedPart
                ? `Auto-selected: ${selectedPart.name}. You can add more parts in the same enquiry before submitting.`
                : "Select one or more parts and submit your enquiry. Our team will confirm availability and schedule delivery/service."}
            </p>

            <div className="mt-8">
              <SparePartsEnquiryForm
                initialPartId={selectedPartId || undefined}
                availableParts={spareParts}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
