
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.featured': 'Featured',
    'nav.contact': 'Contact',
    'hero.title': 'Make Your Party Unforgettable',
    'hero.subtitle': 'Premium party equipment rental for all your celebration needs',
    'hero.cta': 'Browse Services',
    'services.title': 'Our Services',
    'services.subtitle': 'Everything you need for the perfect party',
    'featured.title': 'Inflatable Disco Dome',
    'featured.subtitle': 'The ultimate party experience',
    'featured.description': 'Our star product offers sound, DJ, lighting, LED screens, smoke effects and more, creating an unforgettable atmosphere for your celebration.',
    'featured.cta': 'Book Now',
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Get in touch for party planning',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.phone': 'Phone',
    'contact.follow': 'Follow Us',
    'footer.rights': 'All rights reserved',
    'cart.title': 'Your Cart',
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout',
    'navbar.products': 'Products',
    'navbar.orders': 'Orders',
    'navbar.admin': 'Admin',
    'auth.signIn': 'Sign In',
    'auth.signOut': 'Sign Out',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.featured': 'Destacado',
    'nav.contact': 'Contacto',
    'hero.title': 'Haz Tu Fiesta Inolvidable',
    'hero.subtitle': 'Alquiler de equipos premium para todas tus necesidades de celebración',
    'hero.cta': 'Ver Servicios',
    'services.title': 'Nuestros Servicios',
    'services.subtitle': 'Todo lo que necesitas para la fiesta perfecta',
    'featured.title': 'Domo Disco Inflable',
    'featured.subtitle': 'La experiencia de fiesta definitiva',
    'featured.description': 'Nuestro producto estrella ofrece sonido, DJ, iluminación, pantallas LED, efectos de humo y más, creando una atmósfera inolvidable para tu celebración.',
    'featured.cta': 'Reservar Ahora',
    'contact.title': 'Contáctanos',
    'contact.subtitle': 'Ponte en contacto para planificar tu fiesta',
    'contact.name': 'Nombre',
    'contact.email': 'Correo',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar Mensaje',
    'contact.phone': 'Teléfono',
    'contact.follow': 'Síguenos',
    'footer.rights': 'Todos los derechos reservados',
    'cart.title': 'Tu Carrito',
    'cart.empty': 'Tu carrito está vacío',
    'cart.checkout': 'Pagar',
    'navbar.products': 'Productos',
    'navbar.orders': 'Pedidos',
    'navbar.admin': 'Administración',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signOut': 'Cerrar Sesión',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
