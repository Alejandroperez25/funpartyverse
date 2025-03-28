
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Here you would normally send the form to a backend
    // For now, let's just simulate a sending delay
    setTimeout(() => {
      toast({
        title: 'Mensaje enviado correctamente',
        description: 'Gracias por contactarnos. Te responderemos a la brevedad.',
      });
      
      // Clear form
      setName('');
      setEmail('');
      setMessage('');
      setLoading(false);
    }, 1000);
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">{t('contact.title')}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.name')}
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('contact.namePlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('contact.emailPlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact.message')}
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-funneepurple hover:bg-funneepurple/90" disabled={loading}>
                  {loading ? t('contact.sending') : t('contact.send')}
                </Button>
              </form>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative rounded-xl overflow-hidden h-96 md:h-auto"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <iframe 
              title="Company Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8569068099373!2d-74.07120638573423!3d4.603096296654254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a1f30307cf%3A0xf9b0d78e87c75ea!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1sen!2sco!4v1625590817864!5m2!1sen!2sco" 
              width="100%" 
              height="100%" 
              loading="lazy"
              className="absolute inset-0"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
