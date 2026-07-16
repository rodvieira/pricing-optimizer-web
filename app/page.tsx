import { Button, Text } from "@astryxdesign/core";
import { ThemeToggle } from "@/features/theme/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Text type="label">Pricing Optimizer</Text>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <Text type="display-2">Paste a URL. Get three pricing pages.</Text>
        <Text type="large" color="secondary" className="max-w-xl">
          Pricing Optimizer scrapes your product page, classifies your audience, and streams three
          psychologically distinct pricing-page variations live.
        </Text>
        <Button label="Open the studio" variant="primary" href="/studio" />
      </main>
    </div>
  );
}
