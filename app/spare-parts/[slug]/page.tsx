import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default async function SparePartDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let part = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/spare-parts/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      part = await res.json();
    }
  } catch (err) {
    console.error(err);
  }

  if (!part) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="pt-14 md:pt-20 pb-14 bg-white min-h-screen">
        <section className="container mx-auto px-6 md:px-10 max-w-screen-xl pt-8 md:pt-14">
          <Link
            href="/spare-parts"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            Back to Spare Parts
          </Link>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            <div className="relative aspect-[5/4] rounded-3xl overflow-hidden border border-outline shadow-xl shadow-black/5">
              <Image
                src={part.image || "https://images.unsplash.com/photo-1581092160562-40aa08e78837"}
                alt={part.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">
                {part.category}
              </p>
              <h1 className="mt-3 font-headline text-4xl md:text-6xl leading-tight text-on-surface">
                {part.name}
              </h1>
              {part.partNumber && (
                <p className="mt-1 text-sm font-bold text-on-surface-variant uppercase">
                  Part No: {part.partNumber}
                </p>
              )}
              <p className="mt-4 text-base text-on-surface-variant leading-relaxed">
                {part.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <InfoCard label="Manufacturer" value={part.manufacturer || "OEM"} />
                <InfoCard label="Seller" value={part.seller || "Fixxer OEM Hub"} />
                <InfoCard label="Delivery" value={part.deliveryEta || "3-5 Business Days"} />
                <InfoCard label="Warranty" value={part.warranty || "6 Months Standard"} />
              </div>

              <div className="mt-6 rounded-2xl border border-outline p-5 bg-surface-container-low">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant">
                  Service Booking
                </p>
                <p className="mt-1 text-sm text-on-surface">
                  {part.supportsServiceBooking
                    ? "Available with technician installation support."
                    : "Part-only delivery available."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex h-12 items-center px-5 rounded-xl bg-primary text-on-primary font-black">
                  {part.price}
                </span>
                <Link
                  href={`/spare-parts/enquiry?part=${part._id}`}
                  className="h-12 px-6 rounded-xl bg-zinc-900 text-white inline-flex items-center font-black uppercase tracking-wider text-xs"
                >
                  Quick Buy Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 md:px-10 max-w-screen-xl mt-12 md:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-outline p-6 bg-surface-container-lowest">
              <h2 className="font-headline text-2xl text-on-surface">
                Compatible Models
              </h2>
              {part.compatibleModels && part.compatibleModels.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {part.compatibleModels.map((model: string) => (
                    <li
                      key={model}
                      className="text-sm text-on-surface-variant flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      {model}
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="mt-4 text-sm text-on-surface-variant">Universal fit / General Compatibility reported by Manufacturer.</p>
              )}
            </div>

            <div className="rounded-3xl border border-outline p-6 bg-surface-container-lowest">
              <h2 className="font-headline text-2xl text-on-surface">
                Highlights
              </h2>
              {part.highlights && part.highlights.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {part.highlights.map((highlight: string) => (
                    <li
                      key={highlight}
                      className="text-sm text-on-surface-variant flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-primary text-base">
                        bolt
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-on-surface-variant">Genuine OEM part guaranteed by Maruti Suzuki.</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline bg-surface-container-low p-4 hover:shadow-md transition-shadow">
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 text-sm text-on-surface font-medium">{value}</p>
    </div>
  );
}
