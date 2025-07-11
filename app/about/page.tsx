export const metadata = {
  title: "About | Reventlify",
  description:
    "Reventlify is your all-in-one platform to create, manage, and sell event tickets with ease. Everyone Wins with Reventlify.",
};
import FAQSection from "@/components/about/affiliate-faq";
import AboutNavLinks from "@/components/about/nav-link";
import WinWinDiagram from "@/components/about/win-win";
import Footer from "@/components/footer";
import ImageFallback from "@/components/image-fallback";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <AboutNavLinks />
      <section className="bg-[#5850EC] text-white py-16 px-4 text-center flex flex-col items-center">
        <ImageFallback
          src="/img/Reventlify.png"
          alt="Reventlify"
          // fill
          fallbackSrc="/placeholder.jpg"
          width={105}
          height={105}
          className="object-cover border rounded-full"
        />
        <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
          About Reventlify
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl">
          Your Ultimate Event Ticketing Solution
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 grid gap-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Why Reventlify?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Reventlify is your all-in-one platform to create, manage, and sell
            event tickets with ease. Whether you're an event organizer,
            affiliate, or attendee, we've got you covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        <WinWinDiagram />
        <FAQSection />

        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold mb-4">
            Seamless, Secure, and Rewarding
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Join our growing community and take your event experience to the
            next level. Sell tickets, earn as an affiliate, or simply enjoy
            attending amazing events near you.
          </p>
          <a
            href="/signup"
            className="inline-block bg-[#5850EC] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#5a3edb] transition"
          >
            Get Started
          </a>
        </div>
      </section>
      <section>
        <Footer />
      </section>
    </div>
  );
}

const features = [
  {
    title: "Event Creation & Management",
    description:
      "Create, modify, and manage your events effortlessly. Set event dates, times, locations, and ticket pricing with just a few clicks.",
  },
  {
    title: "Affiliate Program",
    description:
      "Every user is an affiliate! Sell tickets and earn 50% of Reventlify’s profit per sale. Event creators win with boosted sales, affiliates win with real earnings, and ticket buyers enjoy top events. Everyone wins.",
  },
  {
    title: "Ticket Transfers",
    description:
      "Easily transfer tickets between customers, providing a flexible and convenient experience for all attendees.",
  },
  {
    title: "Secure Payments",
    description:
      "Enjoy seamless, secure payment processing with quick withdrawals. Manage your event finances stress-free.",
  },
  {
    title: "Real-Time Notifications",
    description:
      "Keep your audience engaged with timely updates about events near them, tailored to their unique interests.",
  },
  {
    title: "Personalized Dashboard",
    description:
      "Offer users a tailored experience with dashboards that surface events based on their preferences and past activity.",
  },
];
