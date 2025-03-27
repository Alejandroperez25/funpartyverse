
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, Mail, Instagram } from 'lucide-react';

const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  
  // Create scroll-based animations
  const formY = useTransform(scrollY, [1400, 1800], [50, 0]);
  const formOpacity = useTransform(scrollY, [1400, 1800], [0, 1]);
  const infoY = useTransform(scrollY, [1500, 1900], [50, 0]);
  const infoOpacity = useTransform(scrollY, [1500, 1900], [0, 1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
  };

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: t('contact.phone'),
      content: '(727) 910-0076',
      href: 'tel:+17279100076'
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: t('contact.email'),
      content: 'funneekiddee@gmail.com',
      href: 'mailto:funneekiddee@gmail.com'
    },
    {
      icon: <Instagram className="h-5 w-5" />,
      title: 'Instagram',
      content: '@funneekiddee',
      href: 'https://instagram.com/funneekiddee'
    }
  ];

  // Contact info animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="section-container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title text-gradient">{t('contact.title')}</h2>
          <p className="section-subtitle">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form with slide-in effect */}
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            style={{ y: formY, opacity: formOpacity }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form inputs with hover effects */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('contact.name')}
                </label>
                <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Input 
                    id="name" 
                    name="name" 
                    type="text" 
                    required 
                    className="w-full"
                  />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('contact.email')}
                </label>
                <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full"
                  />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t('contact.message')}
                </label>
                <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <Textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    required 
                    className="w-full"
                  />
                </motion.div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-funneepurple hover:bg-funneepurple/90 text-white"
                >
                  {t('contact.send')}
                </Button>
              </motion.div>
            </form>
          </motion.div>
          
          {/* Contact Information with staggered animation */}
          <motion.div 
            className="space-y-8"
            style={{ y: infoY, opacity: infoOpacity }}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                target={item.title === 'Instagram' ? '_blank' : undefined}
                rel={item.title === 'Instagram' ? 'noopener noreferrer' : undefined}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
                variants={item}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <motion.div 
                  className="p-3 bg-funneepurple/10 rounded-full text-funneepurple"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item.icon}
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </div>
              </motion.a>
            ))}
            
            {/* Map with hover effect */}
            <motion.div 
              className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64 mt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224444.96232238098!2d-82.83754159435759!3d27.876051595114058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2b782b3b9d1ef%3A0xa75f1389af96b463!2sSt.%20Petersburg%2C%20FL!5e0!3m2!1sen!2sus!4v1692363175554!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Funnee Kiddee location"
              ></iframe>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
