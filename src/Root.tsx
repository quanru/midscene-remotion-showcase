import { Composition } from "remotion";
import { FourGridComposition } from "./GridComposition";
import { PlatformShowcase, PLATFORM_SHOWCASE_DURATION } from "./PlatformShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FourGrid"
        component={FourGridComposition}
        durationInFrames={446}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PlatformShowcase"
        component={PlatformShowcase}
        durationInFrames={PLATFORM_SHOWCASE_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
