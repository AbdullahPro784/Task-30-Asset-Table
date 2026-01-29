import { getAssets } from "@/components/Data/AssetData";
import ExplorerView from "@/components/ExplorerView";
import LandingHeader from "@/components/Header/LandingHeader";
import CardsGrid from "@/components/Card/CardsGrid";

export default async function Home(props: { searchParams: Promise<{ v?: string }> }) {
  const assets = await getAssets();
  const searchParams = await props.searchParams;
  const variant = searchParams.v;

  // If a variant is selected, show the Explorer
  const validVariants = ["original", "v1", "v2", "v3", "tree"];
  if (variant && validVariants.includes(variant)) {
    return (
      <ExplorerView
        data={assets}
        initialVariant={variant as any}
      />
    );
  }

  // Otherwise show the Landing Page Cards
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-5xl space-y-12">
        <LandingHeader />
        <CardsGrid />
      </div>
    </main>
  );
}
