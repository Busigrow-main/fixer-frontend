import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SparePartsEnquiryForm from "@/app/components/SparePartsEnquiryForm";

export default async function SparePartsEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ part?: string; product?: string; type?: string }>;
}) {
  const params = await searchParams;
  const selectedPartId = params.part ?? "";
  const productSlug = params.product ?? "";
  const enquiryType = params.type ?? "part"; // 'part' or 'appliance'
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  // Fetch all spare parts (high limit so the dropdown is complete)
  let spareParts: any[] = [];
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

  // If there's a pre-selected part, ensure it's in the list (it could be missing
  // if the catalog has >500 items and it didn't land in this page).
  if (selectedPartId) {
    const alreadyPresent = spareParts.some(
      (p: any) => p._id === selectedPartId,
    );
    if (!alreadyPresent) {
      try {
        // The SKU-based endpoint returns a single doc — try fetching by _id via search
        const res = await fetch(
          `${apiBase}/spare-parts?limit=1&id=${selectedPartId}`,
          {
            cache: "no-store",
          },
        );
        if (res.ok) {
          const json = await res.json();
          const found = Array.isArray(json) ? json[0] : json.data?.[0];
          if (found) spareParts = [found, ...spareParts];
        }
      } catch (_) {
        // Silently ignore — the part just won't be pre-selected
      }
    }
  }

  // Find if there's a pre-selected part
  const selectedPart = Array.isArray(spareParts)
    ? spareParts.find((p: any) => p._id === selectedPartId)
    : null;

  // For appliances: use product slug to build product name display
  const isAppliance = enquiryType === "appliance" && productSlug;
  const applianceDisplayName = isAppliance
    ? productSlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : undefined;

  const pageTitle = isAppliance ? "Request Appliance" : "Request Spare Parts";
  const pageDescription = isAppliance
    ? `Auto-selected: ${applianceDisplayName}. Our team will confirm availability and help you with installation scheduling.`
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
                initialProduct={isAppliance ? applianceDisplayName : undefined}
                enquiryType={enquiryType === "appliance" ? "appliance" : "part"}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
