"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Top Links Navigation
export default function AboutNavLinks() {
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Investor Relations", href: "/about/investors" },
    { name: "Impact", href: "/about/impact" },
    { name: "Careers", href: "/about/careers" },
    { name: "Contact Us", href: "/contact" },
  ];

  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-6 text-gray-700 text-sm font-medium">
        {links.map((link, index) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={index}
              href={link.href}
              className={`transition ${
                isActive
                  ? "text-[#6c4eff] underline underline-offset-4"
                  : "hover:text-[#6c4eff]"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
