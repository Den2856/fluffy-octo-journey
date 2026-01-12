import { Facebook, Instagram, Linkedin, Send, Twitter, Youtube, Phone, Inbox, LocateIcon, Clock10 } from "lucide-react";
import FeedbackForm from "./FeedbackForm";

type socialLinks = {
  href: string
  label: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

type ContactItem = {
  title: string;
  label: React.ReactNode;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  blank?: boolean;
};

export default function Feedback() {

  const address = "1446 Stoney Lane, KAMPSVILLE, IL";
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const socialLinks: socialLinks[] = [
  { href: "https://instagram.com/", label: "Instagram", Icon: Instagram },
  { href: "https://facebook.com/", label: "Facebook", Icon: Facebook },
  { href: "https://twitter.com/", label: "X", Icon: Twitter },
  { href: "https://youtube.com/", label: "YouTube", Icon: Youtube },
  { href: "https://linkedin.com/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://t.me/", label: "Telegram", Icon: Send },
  ]

  const contacts: ContactItem[] = [
  { title: "Call Us", label: "+1-202-555-0172", Icon: Phone, href: "tel:+12025550172" },
  { title: "Email Us", label: "opu.rent@gmail.com", Icon: Inbox, href: "mailto:opu.rent@gmail.com" },
  { title: "Visit Office", label: address, Icon: LocateIcon, href: mapHref, blank: true },
  { title: "Open Hours", label: <>Mon-Fri: 9am-5pm <br /> Sat-Sun: 10am-4pm</>, Icon: Clock10 },
  ];

  return (
    <section className="w-full bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="flex-1 lg:flex-[0_0_44%]">
            <div className="h-full grid gap-4 grid-cols-2 sm:grid-cols-6 lg:grid-rows-[60px_1fr_1fr]">
              {socialLinks.map(({ href, label, Icon, }) => (
                <div key={label} className="h-[60px] w-full border border-white/10 bg-dark-200 hover:bg-primary transition-colors duration-300 ease-out flex justify-center items-center">
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className="size-[40px] place-items-center"
                  >
                    <Icon className="size-[40px] text-white/70 transition group-hover:bg-white" />
                  </a>
                </div> 
              ))}

              {contacts.map((c) => {
                const interactive = !!c.href;
                const Wrapper: any = interactive ? "a" : "div";

                return (
                  <Wrapper
                    key={c.title}
                    href={interactive ? c.href : undefined}
                    target={interactive && c.blank ? "_blank" : undefined}
                    rel={interactive && c.blank ? "noreferrer" : undefined}
                    className={[
                      "col-span-2 sm:col-span-3 h-full min-h-40 border border-white/10 bg-dark-200",
                      "flex flex-col justify-center items-center gap-3 transition-colors duration-300 ease-in-out",
                      interactive ? "group cursor-pointer hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50" : "cursor-default",
                    ].join(" ")}
                  >
                    <c.Icon className={`size-6 transition-colors ${interactive ? "text-primary group-hover:text-white" : "text-primary"}`} />

                    <div className="flex flex-col justify-center items-center gap-2">
                      <h2 className="text-md text-white">{c.title}</h2>
                      <p className={interactive ? "text-sm text-white/70 group-hover:text-white/90" : "text-sm text-white/70"}>
                        {c.label}
                      </p>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 lg:flex-[0_0_56%]">
            <FeedbackForm />
          </div>
        </div>
      </div>
    </section>
  );
}
