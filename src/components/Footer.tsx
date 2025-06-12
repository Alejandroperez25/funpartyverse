import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Instagram, Mail, Phone } from 'lucide-react';
const Footer: React.FC = () => {
  const {
    t
  } = useLanguage();
  const currentYear = new Date().getFullYear();
  const socialLinks = [{
    icon: <Instagram className="h-5 w-5" />,
    href: 'https://instagram.com/funneekiddee'
  }, {
    icon: <Mail className="h-5 w-5" />,
    href: 'mailto:funneekiddee@gmail.com'
  }, {
    icon: <Phone className="h-5 w-5" />,
    href: 'tel:+17279100076'
  }];
  const footerLinks = [{
    name: t('nav.home'),
    href: '#home'
  }, {
    name: t('nav.services'),
    href: '#services'
  }, {
    name: t('nav.featured'),
    href: '#featured'
  }, {
    name: t('nav.contact'),
    href: '#contact'
  }];
  return <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/20296858-23a1-4d50-87e5-7867df71b727.png" alt="PlayZone Logo" className="h-12 w-auto" />
              <h2 className="text-2xl font-bold text-funneepurple"></h2>
            </div>
            <p className="mt-4 text-gray-400 max-w-md">
              Premium party equipment rental services for children's celebrations. 
              Making every party special with our high-quality entertainment equipment.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((link, index) => <a key={index} href={link.href} target={link.href.startsWith('https') ? '_blank' : undefined} rel={link.href.startsWith('https') ? 'noopener noreferrer' : undefined} className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-full">
                  {link.icon}
                </a>)}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>)}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="tel:+17279100076" className="hover:text-white transition-colors">
                  (727) 910-0076
                </a>
              </li>
              <li>
                <a href="mailto:funneekiddee@gmail.com" className="hover:text-white transition-colors">
                  funneekiddee@gmail.com
                </a>
              </li>
              <li>
                <a href="https://instagram.com/funneekiddee" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  @funneekiddee
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} PlayZone. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>;
};
export default Footer;