import { HeroSection } from './HeroSection';
import { InteractionDemo } from './InteractionDemo';
import { HotzoneVisualization } from './HotzoneVisualization';
import { FutureVision } from './FutureVision';
import { PhilosophyCards } from './PhilosophyCards';
import { SharingSession } from './SharingSession';
import { DiaryShowcase } from './DiaryShowcase';
import { TechStackFooter } from './TechStackFooter';

export function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: '#06060a',
        color: '#e5e5e7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <HeroSection />

      {/* Divider */}
      <div className="w-full max-w-xl mx-auto h-px bg-gradient-to-r from-transparent via-[rgba(0,207,253,0.08)] to-transparent" />

      <InteractionDemo />

      {/* Divider */}
      <div className="w-full max-w-xl mx-auto h-px bg-gradient-to-r from-transparent via-[rgba(0,207,253,0.08)] to-transparent" />

      <HotzoneVisualization />

      {/* Divider */}
      <div className="w-full max-w-xl mx-auto h-px bg-gradient-to-r from-transparent via-[rgba(0,207,253,0.08)] to-transparent" />

      <FutureVision />

      {/* Divider */}
      <div className="w-full max-w-xl mx-auto h-px bg-gradient-to-r from-transparent via-[rgba(0,207,253,0.08)] to-transparent" />

      <PhilosophyCards />

      {/* Divider */}
      <div className="w-full max-w-xl mx-auto h-px bg-gradient-to-r from-transparent via-[rgba(0,207,253,0.08)] to-transparent" />

      <SharingSession />

      {/* Divider */}
      <div className="w-full max-w-xl mx-auto h-px bg-gradient-to-r from-transparent via-[rgba(0,207,253,0.08)] to-transparent" />

      <DiaryShowcase />

      <TechStackFooter />
    </div>
  );
}
