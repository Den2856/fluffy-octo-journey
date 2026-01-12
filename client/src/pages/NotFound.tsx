import { Link } from "react-router-dom";


export default function NotFound() {
  return (
    <>
      <header className="w-full text-white">
        <div className="mx-auto w-full max-w-[1440px] px-6 pt-5">
          <div className="flex items-center justify-between py-4">
            <Link to="/fleet" className="flex items-center text-xl gap-2 hover:text-primary transition duration-300">
              Models
            </Link>
            <Link to="/" className="text-xl text-white font-semibold tracking-[-0.09em]">
              opu—rent
            </Link>
            <Link to="/" className="flex items-center text-xl gap-2 hover:text-primary transition duration-300">
              Home
            </Link> 
          </div>
        </div>
      </header>
      <section className="w-full text-white">
        <div className="mx-auto w-full max-w-[1440px] pt-5">
          <div className="mt-20 text-center">
              <svg viewBox="0 0 900 300" className="w-full">
                <text
                  x="50%"
                  y="70%"
                  textAnchor="middle"
                  fontFamily="Montserrat, system-ui"
                  fontWeight="900"
                  fontSize="260"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="3"
                >
                  404
                </text>
              </svg>
              <p className="mt-4 text-[18px]">The page you are looking for cannot be found</p>
              <Link to="/" className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition duration-300">
                Go back home
              </Link>
          </div>
        </div>
      </section>
    </>

  );
}