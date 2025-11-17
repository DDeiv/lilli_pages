import { MainCanvas } from "@/components/three/mainCanvas";
import { getSceneItems } from "@/data/portfolioItems";

// Disable caching for development - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const sceneItems = await getSceneItems();

  return (
    <>
      <MainCanvas sceneItems={sceneItems} />
    </>
  );
}
