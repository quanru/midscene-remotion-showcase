import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { staticFile } from "remotion";

const gridVideos = [
  { file: "booking2.mp4", title: "Android", color: "#3ddc84" },
  { file: "github2.mp4", title: "Web", color: "#00b4ff" },
  { file: "meituan2.mp4", title: "iOS", color: "#ff9500" },
  { file: "pc-twitter2.mp4", title: "Computer", color: "#a855f7" },
];

// 每个格子从屏幕外飞入的起始偏移 (x, y)
const entryOffsets = [
  { x: -600, y: -400 },  // 左上 → 从左上飞入
  { x: 600, y: -400 },   // 右上 → 从右上飞入
  { x: -600, y: 400 },   // 左下 → 从左下飞入
  { x: 600, y: 400 },    // 右下 → 从右下飞入
];

// Hero 弹入后，四宫格向四角散开的偏移
const spreadOffsets = [
  { x: -40, y: -30 },
  { x: 40, y: -30 },
  { x: -40, y: 30 },
  { x: 40, y: 30 },
];

const GAP = 12;
const CARD_RADIUS = 14;
const W = 1920;
const H = 1080;
const HALF_W = W / 2 - GAP / 2 - GAP;
const HALF_H = H / 2 - GAP / 2 - GAP;

// 四个格子的最终位置 (基于绝对定位)
const positions = [
  { left: GAP, top: GAP },
  { left: W / 2 + GAP / 2, top: GAP },
  { left: GAP, top: H / 2 + GAP / 2 },
  { left: W / 2 + GAP / 2, top: H / 2 + GAP / 2 },
];

export const FourGridComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === 阶段 1: 四宫格依次飞入 (0s ~ 2s) ===
  const gridEntrySprings = gridVideos.map((_, i) =>
    spring({
      frame,
      fps,
      delay: i * 6, // 每个格子间隔 0.2s
      config: { damping: 14, stiffness: 120, mass: 0.8 },
    }),
  );

  // === 阶段 2: 中心视频在 8s 弹入 ===
  const heroDelay = 8 * fps;
  const heroSpring = spring({
    frame: frame - heroDelay,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.8 },
  });

  // Hero 缩放 + 旋转
  const heroScale = interpolate(heroSpring, [0, 1], [0, 1]);
  const heroRotation = interpolate(heroSpring, [0, 1], [-8, 0]);

  // 发光脉冲
  const glowPhase = frame > heroDelay ? (frame - heroDelay) * 0.08 : 0;
  const glowPulse = interpolate(Math.sin(glowPhase), [-1, 1], [0.4, 1]);

  // Hero 标题渐入
  const titleOpacity = interpolate(frame - heroDelay, [0.3 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame - heroDelay, [0.3 * fps, 0.8 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 背景暗化 + 缩放
  const bgScale = interpolate(heroSpring, [0, 1], [1, 0.92]);
  const bgDim = interpolate(heroSpring, [0, 1], [1, 0.5]);

  // 扫光进度 (每 3 秒循环一次)
  const sweepCycle = (frame % (3 * fps)) / (3 * fps);

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, #0a1628 0%, #000000 70%)",
      }}
    >
      <Audio src={staticFile("bgm.mp3")} volume={0.5} />
      {/* 四宫格 */}
      <AbsoluteFill
        style={{
          transform: `scale(${bgScale})`,
          filter: `brightness(${bgDim})`,
        }}
      >
        {gridVideos.map(({ file, title, color }, i) => {
          const entrance = gridEntrySprings[i];
          const offsetX = interpolate(entrance, [0, 1], [entryOffsets[i].x, 0]);
          const offsetY = interpolate(entrance, [0, 1], [entryOffsets[i].y, 0]);
          const cardScale = interpolate(entrance, [0, 1], [0.6, 1]);
          const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);
          const cardRotation = interpolate(entrance, [0, 1], [15 * (i % 2 === 0 ? -1 : 1), 0]);

          // Hero 弹入后散开
          const spreadX = interpolate(heroSpring, [0, 1], [0, spreadOffsets[i].x]);
          const spreadY = interpolate(heroSpring, [0, 1], [0, spreadOffsets[i].y]);

          // 扫光位置
          const sweepX = interpolate(sweepCycle, [0, 1], [-100, 200]);

          return (
            <div
              key={file}
              style={{
                position: "absolute",
                left: positions[i].left,
                top: positions[i].top,
                width: HALF_W,
                height: HALF_H,
                borderRadius: CARD_RADIUS,
                overflow: "hidden",
                transform: `translate(${offsetX + spreadX}px, ${offsetY + spreadY}px) scale(${cardScale}) rotate(${cardRotation}deg)`,
                opacity: cardOpacity,
                boxShadow: `0 0 20px 4px ${color}44`,
                border: `2px solid ${color}66`,
              }}
            >
              <Video
                src={staticFile(file)}
                muted
                playbackRate={2}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* 扫光效果 */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${sweepX}%`,
                  width: "30%",
                  height: "100%",
                  background: `linear-gradient(90deg, transparent, ${color}18, transparent)`,
                  pointerEvents: "none",
                }}
              />
              {/* 标题标签 */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  backgroundColor: `${color}cc`,
                  color: "white",
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "sans-serif",
                  letterSpacing: 1,
                  boxShadow: `0 0 12px ${color}88`,
                }}
              >
                {title}
              </div>
              {/* 底部渐变 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* 中心 Hero 视频 */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "55%",
            aspectRatio: "16 / 9",
            borderRadius: 16,
            overflow: "hidden",
            transform: `scale(${heroScale}) rotate(${heroRotation}deg)`,
            boxShadow: `0 0 ${50 * glowPulse}px ${20 * glowPulse}px rgba(0, 180, 255, ${0.6 * glowPulse}), 0 0 ${100 * glowPulse}px ${40 * glowPulse}px rgba(0, 120, 255, ${0.3 * glowPulse}), inset 0 0 30px rgba(0, 180, 255, 0.1)`,
            border: `3px solid rgba(0, 180, 255, ${0.7 * glowPulse})`,
            position: "relative",
          }}
        >
          <Video
            src={staticFile("Robotic-arc.mp4")}
            muted
            playbackRate={3}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Hero 标题 */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
              padding: "30px 24px 18px",
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: 38,
                fontWeight: 800,
                fontFamily: "sans-serif",
                textShadow: "0 0 24px rgba(0, 180, 255, 0.9), 0 0 48px rgba(0, 120, 255, 0.4)",
                letterSpacing: 3,
              }}
            >
              Robotic Arm
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* 首帧图片覆盖层 */}
      {frame < 2 * fps && (
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [0, 0.8 * fps, 1.5 * fps], [1, 1, 0], {
              extrapolateRight: "clamp",
            }),
            zIndex: 10,
          }}
        >
          <Img
            src={staticFile("midscene-hero.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
