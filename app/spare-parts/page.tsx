import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SparePartsFilter from "@/app/components/SparePartsFilter";

export default async function SparePartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "All";
  const page = parseInt(params.page || "1", 10);

  let responseData = { data: [], metadata: { totalPages: 1, page: 1, total: 0 } };
  let categories: string[] = [];

  try {
    // 1. Fetch Paginated Data
    const queryStr = new URLSearchParams({
      q,
      category,
      page: page.toString(),
      limit: "24",
    }).toString();

    const fetchParts = fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/spare-parts?${queryStr}`, {
      cache: "no-store",
    });

    // 2. Fetch Distinct Categories
    const fetchCats = fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/spare-parts/meta/categories`, {
      cache: "no-store",
    });

    const [resParts, resCats] = await Promise.all([fetchParts, fetchCats]);

    if (resParts.ok) {
      responseData = await resParts.json();
    }
    if (resCats.ok) {
      categories = await resCats.json();
    }
  } catch (error) {
    console.error("Network or API error:", error);
  }

  const parts = responseData.data || [];
  const { totalPages, total } = responseData.metadata;

  return (
    <>
      <Navbar />
      <main className="pt-14 md:pt-20 pb-14 bg-surface min-h-screen">
        <section className="px-6 pt-4 md:pt-14 pb-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-headline text-5xl md:text-7xl leading-tight tracking-tight text-on-surface mb-4">
              Genuine <span className="italic text-primary">Spare</span> Parts
            </h1>
            <p className="text-[10px] md:text-xs text-on-surface-variant font-black opacity-70 tracking-[0.25em] uppercase">
              Discover OEM-ready components with verified compatibility
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 md:px-10 max-w-screen-2xl">
          {/* SEARCH & FILTERS */}
          <SparePartsFilter
            categories={categories}
            initialCategory={category}
            initialQuery={q}
          />

          <div className="mb-6 flex justify-between items-center text-sm font-medium text-on-surface-variant">
            <p>Showing {parts.length} of {total || 0} parts.</p>
            {q && (
              <p>Search results for <span className="text-primary italic">"{q}"</span></p>
            )}
          </div>

          {parts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-outline">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
                search_off
              </span>
              <p className="text-on-surface-variant text-lg font-headline">No spare parts found.</p>
              <p className="text-sm mt-2">Try adjusting your category or search query.</p>
              <Link href="/spare-parts" className="mt-6 inline-flex text-sm text-primary font-bold">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {parts.map((part: any) => (
                <article
                  key={part._id}
                  className="group flex flex-col bg-white rounded-3xl border border-outline overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-400"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={part.image || "https://images.unsplash.com/photo-1581092160562-40aa08e78837"}
                      alt={part.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between">
                      <div className="flex-1 mr-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-black">
                          {part.category}
                        </p>
                        <p className="text-white font-headline text-lg mt-1 line-clamp-1" title={part.name}>
                          {part.name}
                        </p>
                      </div>
                      <p className="text-white font-black text-xl whitespace-nowrap bg-black/30 px-3 py-1 rounded-lg backdrop-blur-md">
                        {part.price}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                      {part.description}
                    </p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                       <span className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary font-black">
                          {part.manufacturer}
                       </span>
                       {part.partNumber && (
                         <span className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-black">
                            {part.partNumber}
                         </span>
                       )}
                    </div>

                    <div className="mt-auto pt-6 grid grid-cols-2 gap-2">
                      <Link
                        href={`/spare-parts/${part.slug}`}
                        className="h-10 rounded-xl border-2 border-outline flex items-center justify-center text-xs font-black uppercase tracking-wider text-on-surface hover:bg-surface-container"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/spare-parts/enquiry?part=${part._id}`}
                        className="h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-3">
              {page > 1 ? (
                <Link
                  href={`/spare-parts?q=${q}&category=${category}&page=${page - 1}`}
                  className="h-12 px-6 rounded-xl border-2 border-outline flex items-center justify-center text-sm font-black text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined mr-2 text-lg">chevron_left</span>
                  Previous
                </Link>
              ) : (
                <span className="h-12 px-6 rounded-xl border-2 border-outline/50 flex items-center justify-center text-sm font-black text-on-surface-variant/50 cursor-not-allowed">
                   <span className="material-symbols-outlined mr-2 text-lg">chevron_left</span>
                   Previous
                </span>
              )}

              <div className="flex items-center px-4 font-bold text-on-surface">
                Page {page} of {totalPages}
              </div>

              {page < totalPages ? (
                <Link
                  href={`/spare-parts?q=${q}&category=${category}&page=${page + 1}`}
                  className="h-12 px-6 rounded-xl border-2 border-outline flex items-center justify-center text-sm font-black text-on-surface hover:bg-surface-container transition-colors"
                >
                  Next
                  <span className="material-symbols-outlined ml-2 text-lg">chevron_right</span>
                </Link>
              ) : (
                <span className="h-12 px-6 rounded-xl border-2 border-outline/50 flex items-center justify-center text-sm font-black text-on-surface-variant/50 cursor-not-allowed">
                   Next
                   <span className="material-symbols-outlined ml-2 text-lg">chevron_right</span>
                </span>
              )}
            </div>
          )}

        </section>
      </main>
      <Footer />
    </>
  );
}
