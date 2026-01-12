import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Banner from "../components/layout/Banner";
import ReadyDriveBanner from "../components/layout/ReadyDriveBanner";
import CursorFollower from "../components/ui/CursorFollower";
import CarsFilter, { type CarsFiltersValue } from "../components/ui/CarsFilter";
import CarsGrid from "../components/home/CarsGrid";
import { fetchCarOptions } from "../api/cars";




export default function Fleet() {
  
  const [filters, setFilters] = useState<CarsFiltersValue>({});
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [seatOptions, setSeatOptions] = useState<number[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { types, seats } = await fetchCarOptions();
        if (!alive) return;
        setTypeOptions(types);
        setSeatOptions(seats);
      } catch {
        if (!alive) return;
        setTypeOptions(["SUV", "Classic", "Sedans", "Supercar", "Convertible"]);
        setSeatOptions([2, 4, 5]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Header />
      <Banner
        imageUrl="/banners/fleet.png"
        title={<>Our Journey Begins <br/> With Your Voyage</>}
      />

      <div className="flex flex-col max-w-[1440px] mx-auto gap-16 h-min-content py-24 px-16 xl:py-16 xl:px-8 max-sm:py-8 max-sm:px-4">
      
        <CarsFilter
          title="All Our Cars"
          typeOptions={typeOptions}
          seatOptions={seatOptions}
          value={filters}
          onChange={setFilters}
        />

        <CarsGrid featuredOnly={false} filters={filters} />
        
        <ReadyDriveBanner
          title="Ready to Redefine Your Drive?"
          description={<>Enter a world tailored for you—seamless booking and the thrill <br/> of driving a world-class car. Experience luxury, don’t just rent.</>}
          ctaLabel="Browse Our Fleet"
          imageUrl="/cta-img.png"
          to="/fleet"
        />
      </div>
      <Footer />
      <CursorFollower />
    </>
  );
}