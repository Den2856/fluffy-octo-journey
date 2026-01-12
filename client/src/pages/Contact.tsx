import Header from "../components/Header";
import CursorFollower from "../components/ui/CursorFollower";
import ReadyDriveBanner from "../components/layout/ReadyDriveBanner"
import Footer from "../components/Footer";
import Banner from "../components/layout/Banner";
import Feedback from "../components/layout/Feedback";


export default function Contact() {
  return (
    <>
      <Header />
      <Banner
        imageUrl="/banners/contact.png"
        title={<>Every Journey Begins <br/> With A Converastion</>}
        description="Whether you’re ready to book your dream car or simply exploring options, we’ll make the process seamless, personal, and tailored to your needs."
      />

      <div className="flex flex-col max-w-[1440px] mx-auto gap-16 h-min-content py-24 px-16 xl:py-16 xl:px-8 max-sm:py-8 max-sm:px-4">
        
        <Feedback />

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
