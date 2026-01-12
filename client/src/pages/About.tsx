import SplitFeatureSection from "../components/layout/OurHistory";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Banner from "../components/layout/Banner";
import ReadyDriveBanner from "../components/layout/ReadyDriveBanner";
import CursorFollower from "../components/ui/CursorFollower";



export default function About() {
  return (
    <>
      <Header />
      <Banner
        imageUrl="/banners/about.png"
        title={<>Discover The Icons Of <br/> Performence</>}
        description="Discover the heart of our story through passion and dedication. Every step is crafted to inspire your unique adventure with us."
      />

      <div className="flex flex-col max-w-[1440px] mx-auto gap-16 h-min-content py-24 px-16 xl:py-16 xl:px-8 max-sm:py-8 max-sm:px-4">
        
        <SplitFeatureSection
          variant="elite"
          heading="Make The Drive Unforgettable"
          paragraphs={[ "We are not merely a car rental service; we are artisans of luxury, weaving dreams into every mile with unparalleled dedication and craftsmanship. With a fleet of world-class vehicles, each meticulously sculpted by excellence and cutting-edge engineering, we elevate every journey into a symphony of prestige, comfort, and timeless style that resonates with every driver. ",
            "We blend innovative design with seamless, personalized service, ensuring every moment behind the wheel feels like a masterpiece of motion and grace. Our passion drives us to transform ordinary trips into extraordinary experiences, offering a level of sophistication that sets us apart. Whether it’s a business trip or a weekend escape, we tailor each drive to reflect your unique style, making it an unforgettable chapter in your story with every turn of the key." ]}
          image={<img src="/about/1.png" alt="" className="max-h-[580px] w-full object-cover" />}
          stats={[
            { value: "120+", label: <>Luxury Cars Available</> },
            { value: "12+", label: <>Cities Served Globally</> },
            { value: "500+", label: <>Satisfied Customers</> }
          ]}
        />

        <SplitFeatureSection
          variant="standard"
          heading="Setting A New Standard"
          paragraphs={[ "We are dedicated to delivering more than just transportation; we create journeys that embody prestige, performance, and unforgettable experiences with every turn. With years of expertise honed through passion and a relentless drive for innovation, we ensure that every ride reflects the highest standards of comfort, elegance, and precision engineering.",
            "From the moment you step into one of our meticulously maintained vehicles to the final destination, we strive to blend style with functionality, offering a service that goes beyond mere travel. Our mission is to transform every trip into a personalized masterpiece, reflecting your unique taste and leaving a lasting impression of opulence and care." ]}
          image={<img src="/about/2.png" alt="" className="max-h-[580px] w-full object-cover" />}
          stats={[
            { value: "1200+", label: <>Successful rentals completed — from <br/> weekend getaways to extended business trips.</> },
            { value: "98%", label: <>Of clients highlight our seamless <br /> booking as the key reason they return.</> },
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