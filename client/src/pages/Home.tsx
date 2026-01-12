import Header from "../components/Header";
import CarsGrid from "../components/home/CarsGrid";
import Hero from "../components/home/Hero";
import TestimonialsShowcase from "../components/home/TestimonialsShowcase";
import CtaHeading from "../components/layout/CtaHeading";
import CursorFollower from "../components/ui/CursorFollower";
import ReadyDriveBanner from "../components/layout/ReadyDriveBanner"
import Footer from "../components/Footer";
import FAQSection from "../components/layout/FAQSection";
import AutoStepsHero from "../components/home/StepHeroPanel";

const stages = [
  {
    id: "01",
    label: "01: Discover",
    title: "Discover Our Selection",
    description: "Embark on your journey with a handpicked fleet of extraordinary cars, each crafted for stunning design, top performance, and unmatched prestige.",
    imageSrc: "/steps/1.png",
  },
  {
    id: "02",
    label: "02: Select",
    title: "Select Your Favorite",
    description: "Each model blends unique design, performance, and prestige—letting you confidently choose your vision, from a bold supercar to a refined luxury ride.",
    imageSrc: "/steps/2.png",
  },
  {
    id: "03",
    label: "03: Experience",
    title: "Experience The Thrill",
    description: "The keys are yours, the road awaits. As the engine ignites, you embrace thrill, comfort, and freedom in a world-class car.",
    imageSrc: "/steps/3.png",
  },
  {
    id: "04",
    label: "04: Return",
    title: "Return With Ease",
    description: "Luxury extends past the final mile. Our smooth, hassle-free return process ensures peace of mind.",
    imageSrc: "/steps/4.png",
  },
];



export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <div className="flex flex-col max-w-[1440px] mx-auto gap-16 h-min-content py-24 px-16 xl:py-16 xl:px-8 max-sm:py-8 max-sm:px-4">
        <CtaHeading
          id='featured'
          title={<>Explore Our <br /> Exclusive Fleet</>}
          text="Handpicked luxury and sports cars, curated for those who seek more than just a drive – crafted to deliver elegance, power, and an unforgettable journey."
          btnText={<>View All Cars</>}
          btnLink="/fleet"
        />
        <CarsGrid limit={9} />

        <CtaHeading
          id='why-us'
          title={<>Redefining the way <br /> you experience luxury</>}
          text="Elevate your car rental journey with Opurent’s unmatched benefits. Experience luxury and ease like never before with every feature designed for your success."
          btnText={<>Learn More About Us</>}
          btnLink="/fleet"
        />
        <TestimonialsShowcase />
        
        <CtaHeading
          title={<>From Desire to Drive: <br /> A Simple Process</>}
          text="A Simple Process Turning your dream of driving a luxury car into reality has never been this effortless - just follow these easy steps and hit the road in style."
          btnText={<>Take The First Step</>}
          btnLink="/fleet"
        />

        <AutoStepsHero stages={stages} intervalMs={4500} pauseOnHover />

        <FAQSection
          variant="home"
          items={[
            { q: "What documents do I need to rent a car?", a: "A valid driver’s license, passport or government ID, proof of insurance, and a credit card for the security deposit are required." },
            { q: "Is a security deposit required?", a: "Yes. A refundable security deposit is held on your credit card and released once the vehicle is returned in the same condition."},
            { q: "Do you offer delivery or pickup services?", a: "Absolutely. We can deliver your car directly to airports, hotels, or your doorstep for maximum convenience." },
            { q: "What about mileage and fuel policy?", a: "Our cars come with a mileage allowance and a full tank of fuel. Extra miles or unrefilled tanks may result in additional charges." },
            { q: "What is your cancellation policy?", a: "You can cancel your booking up to 48 hours before your scheduled pick-up for a full refund. For cancellations made later, a partial fee may apply." },
            { q: "How do I inspect the car before driving off?", a: "We recommend checking the vehicle together with our staff, taking photos of its condition, and confirming the fuel level before departure." },          
          ]}
        />

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
