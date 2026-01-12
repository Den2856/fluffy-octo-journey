import { Facebook, Instagram, Linkedin, Send, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom"

type FooterLink = { label: string; to: string }

type Props = {
  id?: string
  className?: string
  brandName?: string
  tagline?: string
  quickLinks?: FooterLink[]
  pages?: FooterLink[]
}

const socialLinks = [
  { href: "https://instagram.com/", label: "Instagram", Icon: Instagram },
  { href: "https://facebook.com/", label: "Facebook", Icon: Facebook },
  { href: "https://twitter.com/", label: "X", Icon: Twitter },
  { href: "https://youtube.com/", label: "YouTube", Icon: Youtube },
  { href: "https://linkedin.com/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://t.me/", label: "Telegram", Icon: Send },
]

export default function Footer({
  brandName = "opu—rent",
  tagline = "Luxury lies not in the car, but in how\nthe moment endures.",
  quickLinks = [
    { label: "Home", to: "/" },
    { label: "Featured Cars", to: "#featured" },
    { label: "Why Choose Us?", to: "#why-us" },
    { label: "How It Works", to: "" },
    { label: "FAQ", to: "" },
  ],
  pages = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Car Index", to: "/fleet" },
    { label: "404", to: "/404" },
  ],
}: Props) {
  return (
    <footer className="relative max-w-[1440px] mx-auto overflow-hidden bg-black text-white">
      <div className="relative mx-auto w-full px-6 md:px-10">
        
        <div className="grid grid-cols-12 gap-10 py-14 md:py-16">
          <div className="col-span-12 lg:col-span-7">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold tracking-tight">
                {brandName}
              </div>
            </div>

            <p className="mt-5 max-w-sm whitespace-pre-line text-sm leading-relaxed text-white/70">
              {tagline}
            </p>

            <div className="mt-14">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Contact Us</span>
              </div>

              <div className="mt-4 flex gap-3">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-8 w-8 place-items-center border border-white/15 bg-white/0 transition hover:border-white/30 hover:bg-white/5"
                  >
                    <Icon className="h-4 w-4 text-white/70 transition group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="flex gap-14 lg:justify-end">
              <div className="min-w-[170px]">
                <div className="text-sm font-semibold">Quick Links</div>
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {quickLinks.map((l) => (
                    <li key={l.to + l.label}>
                      <Link
                        to={l.to}
                        className="transition hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-[140px]">
                <div className="text-sm font-semibold">Pages</div>
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {pages.map((l) => (
                    <li key={l.to + l.label}>
                      <Link
                        to={l.to}
                        className="transition hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/10" />

        <div className="flex flex-col gap-3 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <div>Copyright © 2025 Opurent — All Right Reserved</div>

          <Link to="/privacy" className="text-white/60 transition hover:text-white">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
