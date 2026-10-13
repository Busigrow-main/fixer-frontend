import ShopHeader from "@/app/components/shop/ShopHeader";
import Footer from "@/app/components/Footer";
import SparePartsEnquiryForm from "@/app/components/SparePartsEnquiryForm";

type SearchParams = {
  part?: string;
  product?: string;
  type?: string;
};

type EnquiryPageProps = {
  searchParams: Promise<SearchParams>;
};

async function fetchJson(
  url: string,
  options?: RequestInit,
) {
  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Shop enquiry fetch failed:", error);
    return null;
  }
}

export default async function SparePartsEnquiryPage({
  searchParams,
}: EnquiryPageProps) {
  const params = await searchParams;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000/api/v1";

  const partId = params.part?.trim() || "";
  const productSlug = params.product?.trim() || "";
  const isAppliance =
    params.type === "appliance" && Boolean(productSlug);

  /*
   * Keep the existing catalogue contract.
   *
   * Part mode:
   *   GET /spare-parts?limit=500&isActive=true
   *
   * Appliance mode:
   *   GET /appliances/ac/{slug}
   */
  const partsResponse = await fetchJson(
    `${apiUrl}/spare-parts?limit=500&isActive=true`,
  );

  const parts = Array.isArray(partsResponse)
    ? partsResponse
    : Array.isArray(partsResponse?.data)
      ? partsResponse.data
      : Array.isArray(partsResponse?.parts)
        ? partsResponse.parts
        : [];

  let selectedPart = null;

  if (partId) {
    selectedPart =
      parts.find(
        (part: any) =>
          String(part?._id || part?.id || "") ===
          String(partId),
      ) || null;

    /*
     * If the selected part wasn't present in the 500-item
     * catalogue response, try the direct part endpoint.
     */
    if (!selectedPart) {
      selectedPart = await fetchJson(
        `${apiUrl}/spare-parts/${encodeURIComponent(partId)}`,
      );
    }
  }

  let applianceProduct = null;

  if (isAppliance) {
    applianceProduct = await fetchJson(
      `${apiUrl}/appliances/ac/${encodeURIComponent(
        productSlug,
      )}`,
    );

    /*
     * Some API responses wrap the product.
     */
    if (applianceProduct?.product) {
      applianceProduct = applianceProduct.product;
    }
  }

  const pageTitle = isAppliance
    ? "Request this appliance"
    : selectedPart
      ? "Request this spare part"
      : "Request a spare part";

  const pageDescription = isAppliance
    ? "Tell us when and where you need it. We'll confirm availability and the next steps."
    : selectedPart
      ? "Share your details and we'll confirm compatibility, availability and the next steps."
      : "Choose the part you need, add your details and we'll help confirm availability.";

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {/* Page intro */}
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Fixxer Shop
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
            {pageTitle}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {pageDescription}
          </p>

          {/* Context summary */}
          {selectedPart ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                {selectedPart.imageUrls?.[0] ||
                selectedPart.image ||
                selectedPart.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      selectedPart.imageUrls?.[0] ||
                      selectedPart.image ||
                      selectedPart.imageUrl
                    }
                    alt={selectedPart.name || "Selected spare part"}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-lg">⚙️</span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wide text-primary">
                  Selected part
                </p>

                <p className="mt-0.5 truncate text-sm font-black text-slate-900">
                  {selectedPart.name || "Spare part"}
                </p>

                {selectedPart.sku ||
                selectedPart.partNumber ? (
                  <p className="mt-0.5 font-mono text-[9px] font-semibold text-slate-400">
                    {selectedPart.sku ||
                      selectedPart.partNumber}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {applianceProduct ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                {applianceProduct.image ||
                applianceProduct.imageUrl ||
                applianceProduct.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      applianceProduct.image ||
                      applianceProduct.imageUrl ||
                      applianceProduct.images?.[0]
                    }
                    alt={
                      applianceProduct.name ||
                      "Selected appliance"
                    }
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-lg">❄️</span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wide text-primary">
                  Selected appliance
                </p>

                <p className="mt-0.5 truncate text-sm font-black text-slate-900">
                  {applianceProduct.name ||
                    "Air conditioner"}
                </p>

                {applianceProduct.modelNumber ||
                applianceProduct.model ? (
                  <p className="mt-0.5 font-mono text-[9px] font-semibold text-slate-400">
                    {applianceProduct.modelNumber ||
                      applianceProduct.model}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {/* Form */}
        <div className="mx-auto mt-6 max-w-3xl">
          <SparePartsEnquiryForm
            parts={parts}
            initialPartId={
              selectedPart?._id ||
              selectedPart?.id ||
              partId ||
              ""
            }
            applianceProduct={
              isAppliance ? applianceProduct : null
            }
            isAppliance={isAppliance}
          />
        </div>

        {/* Reassurance */}
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
          <TrustCard
            title="Compatibility first"
            description="We'll help confirm the right part."
          />

          <TrustCard
            title="No payment here"
            description="This is a request, not checkout."
          />

          <TrustCard
            title="Track your request"
            description="See submitted requests in My Bookings."
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrustCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/[0.07] text-[10px] font-black text-primary">
          ✓
        </span>

        <p className="text-[10px] font-black text-slate-800">
          {title}
        </p>
      </div>

      <p className="mt-1.5 pl-8 text-[9px] font-semibold leading-4 text-slate-400">
        {description}
      </p>
    </div>
  );
}