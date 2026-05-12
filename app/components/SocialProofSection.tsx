import Image from "next/image";

const TECH_HANDS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCguhSK33TG_RhXjxPbw7POcfXs9-NRuQIySs8uBnSClHaAKf0MDJYwoSAfFrvsewluvm_QPxXCndf98FvCShQnI3QL2ZPqdAw8O-6Udb7201x4ePL_6jIVmEema2AxlxRCKkGRybo5ys033s0j4Nn_WOpJxeUqrCJwz5lnz1Fi9ViBQ9oY_3TPoJMiRELHZouZ8BA753Yu7hGJEDdi-tFlQYh7IfX_sUlfTEInIu82mD1JZnub_wLfWRgrO5KC3U2n0vYkFH9MY6o";

const SERVICE_VAN_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAlRn2GIMR81b1Q3zRZmqoxQJgcPZ-4Veug5O-QfGpunsv8HlwrRIdCnHvfOpNWwuucu0dpjp1rX6AYg22x434EpalzupYaUUov-O4b1hDQvbchx9TAueQoHGoQN0oA7MiRTH1Mc5XYrhYhfNggAR66uJiKSxS7CnqruWEDqyHUGH4SPhNYSiyCtnZLbefeo_yDMAlgniiGiGe2tsfvXQI4x7vEYebqAIEBHsLv1GW6JsLAoDqaDSKdhZu3q1vWcTzeGkfLcr_X3_M";

export default function SocialProofSection() {
  return (
    <section className="pt-8 pb-10 md:py-20 bg-surface-dim border-y border-outline-variant overflow-hidden">
      <div className="container mx-auto px-4 md:px-10 max-w-screen-2xl">
        <div className="bg-surface-container-lowest rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 xl:p-16 shadow-xl shadow-black/[0.03] relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 md:gap-14">
          
          {/* ── Left: Testimonial ── */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Badge */}
            <div className="inline-flex self-start items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-6 md:mb-8 transition-transform hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined icon-filled text-secondary text-[14px] md:text-sm">
                stars
              </span>
              <span className="font-label text-[9px] md:text-xs font-black uppercase tracking-wider">
                Local Expert Badge
              </span>
            </div>

            <h2 className="font-headline text-3xl md:text-6xl text-on-surface mb-5 md:mb-8 tracking-tight leading-tight md:leading-tight">
              Trusted by your{" "}
              <span className="italic text-primary">neighbors</span>.
            </h2>

            {/* Review */}
            <div className="border-l-3 md:border-l-4 border-primary pl-5 md:pl-8 group">
              {/* Stars */}
              <div className="flex gap-0.5 text-secondary mb-3 md:mb-4">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined icon-filled text-lg md:text-xl"
                  >
                    star
                  </span>
                ))}
              </div>

              <p className="text-base md:text-xl italic font-headline text-on-surface mb-4 md:mb-5 leading-relaxed md:leading-relaxed">
                "Best appliance service provider in Patna. The technician was a master at his craft and fixed our refrigerator within an hour. Highly recommended!"
              </p>
              <p className="font-label text-[10px] md:text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                — Rajesh K., Raja Bazar
              </p>
            </div>

            {/* Mini trust bar: Wrapping on mobile, full flex on desktop */}
            <div className="mt-8 md:mt-12 flex flex-wrap gap-4 md:gap-8 pt-6 md:pt-8 border-t border-outline">
              {[
                { icon: "verified", text: "Licensed" },
                { icon: "support_agent", text: "24/7 Support" },
                { icon: "thumb_up", text: "Guarantee" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined icon-filled text-primary text-lg md:text-xl">
                    {icon}
                  </span>
                  <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Mosaic ── */}
          <div className="lg:w-1/2 grid grid-cols-2 gap-3 md:gap-4 w-full">
            {/* Col 1 (offset top) */}
            <div className="space-y-3 md:space-y-4 pt-8 md:pt-12">
              {/* Rating card */}
              <div className="bg-surface-container rounded-xl md:rounded-2xl p-4 md:p-6 text-center group hover:bg-primary hover:text-white transition-all duration-300">
                <p className="text-2xl md:text-4xl font-headline font-bold text-primary group-hover:text-white transition-colors duration-300 mb-0.5">
                  4.9/5
                </p>
                <p className="font-label text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-on-surface-variant group-hover:text-white/80 transition-colors duration-300">
                  Avg Rating
                </p>
              </div>

              {/* Hands image */}
              <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={TECH_HANDS_IMG}
                  alt="Precision appliance repair"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3 md:space-y-4">
              {/* Van image */}
              <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={SERVICE_VAN_IMG}
                  alt="Fixxer service van"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>

              {/* Clients card */}
              <div className="bg-primary rounded-xl md:rounded-2xl p-4 md:p-6 text-center cursor-default group hover:bg-on-surface transition-all duration-300 translate-y-0 active:scale-95">
                <p className="text-2xl md:text-4xl font-headline font-bold text-on-primary mb-0.5">
                  12k+
                </p>
                <p className="font-label text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-on-primary/80">
                  Local Repairs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
