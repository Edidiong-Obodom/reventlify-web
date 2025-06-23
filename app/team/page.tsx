export const metadata = {
  title: "Team | Reventlify",
  description: "Meet our team",
};

import AboutNavLinks from "@/components/about/nav-link";
import Footer from "@/components/footer";
import ImageFallback from "@/components/image-fallback";
import React from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";

const TeamPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <AboutNavLinks />
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[23rem]"
        style={{
          backgroundImage: "url('/img/team.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Meet Our Team
          </h1>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Edidiong Obodom */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <ImageFallback
            src="/img/me.jpeg"
            fallbackSrc="https://avatars.githubusercontent.com/u/0000000?v=4"
            alt="Edidiong Obodom"
            className="rounded-full object-cover mb-4"
            width={232}
            height={232}
          />
          <h3 className="text-2xl font-semibold mb-1">Edidiong Obodom</h3>
          <p className="text-[#6c4eff] font-medium mb-4 text-center">
            Founder, CEO & Executive Chair
          </p>
          <p className="text-gray-600 text-center">
            Edidiong is a seasoned Software Engineer. A graduate of University
            of Calabar, he has built scalable web and mobile applications, and
            now leads the vision behind Reventlify — a platform that connects
            communities through smart event ticketing.
          </p>
          <div className="mt-4 flex space-x-4">
            <a
              href="https://github.com/Edidiong-Obodom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FaGithub className="w-6 h-6 text-gray-700 hover:text-black" />
            </a>
            <a
              href="https://linkedin.com/in/edidiong-obodom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="w-6 h-6 text-blue-600 hover:text-blue-800" />
            </a>
          </div>
        </div>

        {/* Placeholder for future team members */}
        {/* COPY this card block when adding more teammates */}
      </section>
      <section>
        <Footer />
      </section>
    </div>
  );
};

export default TeamPage;
