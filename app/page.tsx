// app/page.tsx
import DesignCard from '@/components/designs/DesignCard';
import { fetchDesigns } from '@/lib/actions';
import SplashScreen from '@/components/SplashScreen';
import RevealTransition from '@/components/RevealTransition';
import HeroSection from '@/components/HeroSection';


export default async function Home() {
  const designs = await fetchDesigns();

  return (
    <div>
      <main>
        <SplashScreen />
        <RevealTransition />
        <HeroSection />

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">أحدث التصاميم</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}

          </div>
        </section>
      </main>
    </div>
  );
}