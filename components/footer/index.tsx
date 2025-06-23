import React from "react";
import { Mail, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and Contact */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Reventlify</h2>
          <p className="mb-2 flex items-center gap-2">
            <a
              href="mailto:support@reventlify.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Mail size={18} className="inline" />{" "}
              <span>support@reventlify.com</span>
            </a>
          </p>
          <p className="mb-2 flex items-center gap-2">
            <a
              href="tel:+2349020696451"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone size={18} className="inline" /> +234 902 069 6451
            </a>
          </p>
          <p className="mb-2">22 Road B close, Festac Town, Lagos, Nigeria</p>
          <div className="flex gap-4 mt-4">
            <a
              href="https://www.instagram.com/reventlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-gray-400"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://web.facebook.com/people/Reventlify/61576203459069/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-gray-400"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/reventlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-gray-400"
            >
              <FaLinkedinIn size={20} />
            </a>
            <a
              href="https://x.com/reventlify"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:text-gray-400"
            >
              <FaXTwitter size={20} />
            </a>
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-gray-400">
                About
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Investors
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-gray-400">
                Help
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Developers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Security
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-gray-400">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-gray-400">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Reventlify. All rights reserved.
      </div>
    </footer>
  );
}
