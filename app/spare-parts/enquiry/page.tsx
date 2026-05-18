import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SparePartsEnquiryForm from "@/app/components/SparePartsEnquiryForm";
import type { ACProduct } from "@/app/components/appliances/types";

export default async function SparePartsEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ part?: string; product?: string; type?: string }>;
}) {
  const params = await searchParams;
  const selectedPartId = params.part ?? "";
  const productSlug = params.product ?? "";
  const enquiryType = params.type ?? "part";
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  let spareParts: { _id: string; name: string; price?: number; brandSlug?: string }[] =
    [];
  try {
    const res = await fetch(`${apiBase}/spare-parts?limit=500&isActive=true`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      spareParts = Array.isArray(json) ? json : json.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch spare parts:", error);
  }

  if (selectedPartId) {
    const alreadyPresent = spareParts.some(
      (p) => p._id === selectedPartId,
    );
    if (!alreadyPresent) {
      try {
        const res = await fetch(
          `${apiBase}/spare-parts?limit=1&id=${selectedPartId}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const json = await res.json();
          const found = Array.isArray(json) ? json[0] : json.data?.[0];
          if (found) spareParts = [found, ...spareParts];
        }
      } catch {
        // Pre-selected part may be missing from dropdown
      }
    }
  }

  const selectedPart = spareParts.find((p) => p._id === selectedPartId) ?? null;

  const isAppliance = enquiryType === "appliance" && Boolean(productSlug);
  let selectedAppliance: ACProduct | null = null;
  let applianceLoadError = false;

  if (isAppliance) {
    try {
      const res = await fetch(`${apiBase}/appliances/ac/${productSlug}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        selectedAppliance = json.product ?? null;
      } else {
        applianceLoadError = true;
      }
    } catch (error) {
      console.error("Failed to fetch appliance:", error);
      applianceLoadError = true;
    }
  }

  const pageTitle = isAppliance ? "Request Appliance" : "Request Spare Parts";
  const pageDescription = isAppliance
    ? selectedAppliance
      ? `Enquiring about ${selectedAppliance.name}. Fill in your details and we will confirm availability and installation scheduling.`
      : applianceLoadError
        ? "We could not load this product. Please go back and try again, or contact us on WhatsApp."
        : "Loading product details…"
    : selectedPart
      ? `Auto-selected: ${selectedPart.name}. You can add more parts in the same enquiry before submitting.`
      : "Select one or more parts and submit your enquiry. Our team will confirm availability and schedule delivery/service.";

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
              {pageTitle}
            </h1>
            <p className="mt-3 text-sm md:text-base text-on-surface-variant">
              {pageDescription}
            </p>

            <div className="mt-8">
              <SparePartsEnquiryForm
                initialPartId={selectedPartId || undefined}
                availableParts={spareParts}
                enquiryType={enquiryType === "appliance" ? "appliance" : "part"}
                selectedAppliance={selectedAppliance}
                applianceLoadError={applianceLoadError}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
