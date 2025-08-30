import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Devnovate</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering developers to share knowledge, build communities, and inspire the next generation of innovators. 
              Join thousands of developers sharing insights and experiences.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@devnovate.com"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Explore Articles
                </Link>
              </li>
              <li>
                <Link
                  to="/trending"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Trending
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Write Article
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Devnovate. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Made with <Heart className="inline w-4 h-4 text-red-500" /> for the developer community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
