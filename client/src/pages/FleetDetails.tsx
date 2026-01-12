import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import CursorFollower from "../components/ui/CursorFollower";
import ReadyDriveBanner from "../components/layout/ReadyDriveBanner";
import Footer from "../components/Footer";
import Spinner from "../components/ui/Spinner";
import FlletSlider from "../components/flleet-index/FleetSlider";
import RentHeroCard from "../components/flleet-index/RentCard";
import FloatingRentBar from "../components/flleet-index/FloatingRentBar";
import SpecsOverview from "../components/flleet-index/SpecsOverview";
import FleetServices from "../components/flleet-index/FleetServices";
import FleetRecommendations from "../components/flleet-index/FleetRecommendations";

import { buildSlides } from "../lib/buildSlides";
import { FILLER_IMAGES } from "../data/fillers";
import { fetchCarBySlug } from "../api/cars";
import { type CarCardDTO } from "../types/car.types";

import { BadgeCheck, Calendar, Crown } from "lucide-react";
import FAQSection from "../components/layout/FAQSection";


export default function FleetDetails() {
  const { slug } = useParams<{ slug: string }>();

  const sliderWrapRef = useRef<HTMLDivElement | null>(null);
  const servicesWrapRef = useRef<HTMLDivElement | null>(null);

  const [car, setCar] = useState<CarCardDTO | null>(null);
  const [hide, setHide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        if (!slug) throw new Error("No car slug in URL");

        const data = await fetchCarBySlug(slug);

        if (!alive) return;
        setCar(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load car");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    const stopEl = servicesWrapRef.current;
    if (!stopEl) return;

    const obs = new IntersectionObserver(
      ([entry]) => setHide(entry.isIntersecting),
      {
        threshold: 0.25,
        rootMargin: "-80px 0px 0px 0px",
      }
    );

    obs.observe(stopEl);
    return () => obs.disconnect();
  }, []);

  const slides = useMemo(() => {
    if (!car) return [];

    const real = [
      car.thumbnailUrl ? { url: car.thumbnailUrl, alt: `${car.make} ${car.model}` } : null,
      ...car.gallery?.map((g) => g?.url ? { url: g.url, alt: g.alt ?? `${car.make} ${car.model}` } : null) ?? [],
    ].filter(Boolean) as { url: string; alt?: string }[];

    return buildSlides(real, FILLER_IMAGES, 10);
  }, [car]);

  return (
    <>
      <Header />

      <div className="flex flex-col max-w-[1440px] mx-auto gap-16 h-min-content py-24 px-16 xl:py-16 xl:px-8 max-sm:py-8 max-sm:px-4">
        {loading && <Spinner />}
        {!loading && err && <div>{err}</div>}

        {!loading && !err && car && (
          <>
            <div ref={sliderWrapRef}>
              <FlletSlider
                title={`${car.make} ${car.model}`}
                thumbnailUrl={car.thumbnailUrl}
                slides={slides}
                minSlides={10}
              />
            </div>

            <RentHeroCard
              make={car.make}
              model={car.model}
              pricePerDay={car.pricePerDay}
              seats={car.chips?.seats}
              hp={car.chips?.horsepower}
              transmission={car.chips?.transmission}
              fuel={car.chips?.fuel}
            />

            <FloatingRentBar
              watchRef={sliderWrapRef}
              stopRef={servicesWrapRef}
              to={`/contact`}
              make={car.make}
              model={car.model}
              pricePerDay={car.pricePerDay}
              currency={car.currency}
              thumbnailUrl={car.thumbnailUrl}
              className={`${ hide ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100 translate-y-0"} `}
            />

            <SpecsOverview car={car} slides={slides} />
          </>

        )}

        <div className="flex flex-col gap-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Service Highlights:
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FleetServices icon={BadgeCheck} title="Quality Assured" description="Every vehicle is carefully inspected" />
            <FleetServices icon={Calendar} title="Hassle-Free Booking" description="Smooth and secure booking process" />
            <FleetServices icon={Crown} title="Feature-Packed" description="Performance, comfort, and prestige" />
          </div>
        </div>


        {car && <FleetRecommendations slug={car.slug} />} 

        

        <FAQSection
          variant="car"
          items={[
            { q: "What documents do I need to rent a car?", a: "A valid driver’s license, passport or government ID, proof of insurance, and a credit card for the security deposit are required." },
            { q: "Is a security deposit required?", a: "Yes. A refundable security deposit is held on your credit card and released once the vehicle is returned in the same condition."},
            { q: "Do you offer delivery or pickup services?", a: "Absolutely. We can deliver your car directly to airports, hotels, or your doorstep for maximum convenience." },
            { q: "What about mileage and fuel policy?", a: "Our cars come with a mileage allowance and a full tank of fuel. Extra miles or unrefilled tanks may result in additional charges." },
          ]}
        />

        <ReadyDriveBanner
          title="Ready to Redefine Your Drive?"
          description={
            <>
              Enter a world tailored for you—seamless booking and the thrill <br />
              of driving a world-class car. Experience luxury, don’t just rent.
            </>
          }
          ctaLabel="Browse Our Fleet"
          imageUrl="/cta-img.png"
          to="/fleet"
        />

      </div>
      
      <div ref={servicesWrapRef}>
        <Footer />
      </div>
      
      <CursorFollower />
    </>
  );
}
