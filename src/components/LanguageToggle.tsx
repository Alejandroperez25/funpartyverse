
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button 
      onClick={toggleLanguage} 
      variant="ghost" 
      size="icon" 
      className="group relative flex items-center justify-center h-10 w-10 rounded-full overflow-hidden"
      aria-label="Toggle language"
    >
      <Globe className="h-5 w-5 transition-all group-hover:scale-110" />
      <span className="absolute -bottom-5 opacity-0 group-hover:opacity-100 group-hover:-bottom-1 text-xs font-medium transition-all">
        {language.toUpperCase()}
      </span>
    </Button>
  );
};

export default LanguageToggle;
