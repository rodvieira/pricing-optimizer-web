import { Hero } from "./components/hero";
import { ProductPreview } from "./components/product-preview";
import { StrategyTrio } from "./components/strategy-trio";

export function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <ProductPreview />
      <StrategyTrio />
    </main>
  );
}
