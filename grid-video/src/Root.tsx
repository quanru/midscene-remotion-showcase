import { Composition } from "remotion";
import { FourGridComposition } from "./Composition";

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
    </>
  );
};
