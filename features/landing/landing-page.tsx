import { Hero } from "./components/hero";
import { ProductPreview } from "./components/product-preview";
import { StrategyTrio } from "./components/strategy-trio";
import { TopRibbon } from "./components/top-ribbon";

export function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <TopRibbon />
      <Hero />
      <ProductPreview />
      <StrategyTrio />
    </main>
  );
}
