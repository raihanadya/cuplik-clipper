import React from 'react';
import { HeroSection } from '../../components/landing/HeroSection.jsx';
import { HowItWorksSection } from '../../components/landing/HowItWorksSection.jsx';
import { FeaturesBento } from '../../components/landing/FeaturesBento.jsx';
import { TemplateShowcase } from '../../components/landing/TemplateShowcase.jsx';
import { FaqSection } from '../../components/landing/FaqSection.jsx';
import { CtaBanner } from '../../components/landing/CtaBanner.jsx';

export function LandingPage() {
  return (
    <div className="relative">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesBento />
      <TemplateShowcase />
      <FaqSection />
      <CtaBanner />
    </div>
  );
}

export default LandingPage;
