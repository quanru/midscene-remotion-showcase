import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video, Audio } from "@remotion/media";
import { staticFile } from "remotion";

// aiActTime: 原始视频中的秒数（加速前）
const videos = [
  {
    file: "su72.mp4",
    title: "Android",
    icon: "🤖",
    subtitle: "AI-driven Mobile Testing",
    color: "#3ddc84",
    videoDuration: 30.13,
    playbackRate: 3,
    aiActTime: 4,
    aiActText: "aiAct('打开懂车帝，搜索 su7 车型，查看参数配置')",
  },
  {
    file: "github2.mp4",
    title: "Web",
    icon: "🌐",
    subtitle: "Browser Automation",
    color: "#00b4ff",
    videoDuration: 30,
    playbackRate: 3,
    aiActTime: 2,
    aiActText:
      "aiAct('Sign up for Github, you need to pass the form validation, but don't actually click.')",
  },
  {
    file: "meituan2.mp4",
    title: "iOS",
    icon: "📱",
    subtitle: "AI-driven iOS Testing",
    color: "#ff9500",
    videoDuration: 76.37,
    playbackRate: 3,
    aiActTime: 7,
    aiActText:
      "aiAct('打开美团，帮我下单一杯 manner 超大杯冰美式咖啡，要加浓少冰喔，到结算页面让我确认')",
  },
  {
    file: "pc-twitter2.mp4",
    title: "Computer",
    icon: "🖥️",
    subtitle: "Desktop Automation",
    color: "#a855f7",
    videoDuration: 29.7,
    playbackRate: 3,
    aiActTime: 2,
    aiActText:
      "aiAct('\nText content: Midscene now supports AutoGLM!\nMedia content: Use the AutoGLM video from the download folder!\n')",
  },
  {
    file: "Robotic-arc.mp4",
    title: "Robotic Arm",
    icon: "🦾",
    subtitle: "Physical World Automation",
    color: "#ef4444",
    videoDuration: 180.6,
    playbackRate: 5,
  },
];

const FPS = 30;
const CARD_FRAMES = 40; // 介绍卡片时长 (~1.3s)
const CARD_VIDEO_OVERLAP = 10; // 卡片和视频之间的交叉溶解
// 加速后的视频帧数
const videoFrames = videos.map((v) =>
  Math.ceil((v.videoDuration / v.playbackRate) * FPS),
);

// 构建时间线: [card0, video0, card1, video1, ...]
// 卡片淡出和视频淡入有 CARD_VIDEO_OVERLAP 帧重叠
type TimelineItem =
  | { type: "card"; index: number; frames: number; start: number }
  | { type: "video"; index: number; frames: number; start: number };

const timeline: TimelineItem[] = [];
let cursor = 0;

videos.forEach((_, i) => {
  // 介绍卡片
  timeline.push({ type: "card", index: i, frames: CARD_FRAMES, start: cursor });
  cursor += CARD_FRAMES - CARD_VIDEO_OVERLAP;

  // 视频
  timeline.push({ type: "video", index: i, frames: videoFrames[i], start: cursor });
  cursor += videoFrames[i];
});

export const PLATFORM_SHOWCASE_DURATION = cursor;

// ============ 平台介绍卡片 ============
const PlatformCard: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}> = ({ icon, title, subtitle, color }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 整体弹入
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 120, mass: 0.8 },
  });
  const enterScale = interpolate(enterSpring, [0, 1], [0.6, 1]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // 淡出
  const fadeOut = interpolate(
    frame,
    [durationInFrames - CARD_VIDEO_OVERLAP, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // icon 弹跳
  const iconSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  });
  const iconScale = interpolate(iconSpring, [0, 1], [0, 1]);

  // 副标题渐入
  const subOpacity = interpolate(frame, [12, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [12, 22], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 装饰线展开
  const lineWidth = interpolate(frame, [6, 20], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 发光脉冲
  const glow = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.5, 1]);

  // 背景粒子
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2 + frame * 0.02;
    const radius = 250 + Math.sin(frame * 0.05 + i) * 40;
    const x = 960 + Math.cos(angle) * radius;
    const y = 540 + Math.sin(angle) * radius;
    const size = 3 + (i % 3);
    return { x, y, size, opacity: 0.15 + (i % 4) * 0.05 };
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, ${color}18 0%, #0a0e1a 50%, #000 100%)`,
        justifyContent: "center",
        alignItems: "center",
        opacity: enterOpacity * fadeOut,
      }}
    >
      {/* 背景粒子 */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: `${color}`,
            opacity: p.opacity * glow,
          }}
        />
      ))}

      {/* 内容容器 */}
      <div
        style={{
          textAlign: "center",
          transform: `scale(${enterScale})`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 20,
            transform: `scale(${iconScale})`,
            filter: `drop-shadow(0 0 ${20 * glow}px ${color}88)`,
          }}
        >
          {icon}
        </div>

        {/* 平台名称 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily: "sans-serif",
            color: "white",
            letterSpacing: 6,
            textShadow: `0 0 ${30 * glow}px ${color}88, 0 0 60px ${color}44`,
          }}
        >
          {title}
        </div>

        {/* 装饰线 */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            margin: "16px auto",
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />

        {/* 副标题 */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            fontFamily: "sans-serif",
            color: `${color}cc`,
            letterSpacing: 4,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            textShadow: `0 0 16px ${color}44`,
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============ aiAct 打字机 ============
const TypewriterText: React.FC<{
  text: string;
  startFrame: number;
  color: string;
}> = ({ text, startFrame, color }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const bgSpring = spring({
    frame: elapsed,
    fps,
    config: { damping: 14, stiffness: 140 },
  });
  const bgScale = interpolate(bgSpring, [0, 1], [0.8, 1]);
  const bgOpacity = interpolate(bgSpring, [0, 1], [0, 1]);

  const charsToShow = Math.min(Math.floor(elapsed / 2), text.length);
  const displayText = text.slice(0, charsToShow);
  const showCursor = elapsed % 8 < 5 && charsToShow < text.length;

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 5],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const glow = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.5, 1]);

  return (
    <div
      style={{
        opacity: bgOpacity * fadeOut,
        transform: `scale(${bgScale})`,
        transformOrigin: "top left",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          border: `1.5px solid ${color}66`,
          borderRadius: 12,
          padding: "20px 28px",
          backdropFilter: "blur(8px)",
          boxShadow: `0 0 ${20 * glow}px ${color}22`,
        }}
      >
        <pre
          style={{
            fontSize: 28,
            fontWeight: 600,
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
            color: "#e0e0e0",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "#82aaff" }}>aiAct</span>
          <span style={{ color: "#c3e88d" }}>
            {displayText.replace(/^aiAct/, "")}
          </span>
          {showCursor && (
            <span
              style={{
                color,
                fontWeight: 700,
                textShadow: `0 0 8px ${color}`,
              }}
            >
              ▎
            </span>
          )}
        </pre>
      </div>
    </div>
  );
};

// ============ 视频片段 ============
const VideoSegment: React.FC<{
  file: string;
  title: string;
  color: string;
  playbackRate: number;
  isLast: boolean;
  aiActStartFrame?: number;
  aiActText?: string;
}> = ({ file, title, color, playbackRate, isLast, aiActStartFrame, aiActText }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 淡入（从卡片交叉过来）
  const fadeIn = interpolate(frame, [0, CARD_VIDEO_OVERLAP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 淡出（最后一段渐黑，其他段由下一张卡片接管）
  const fadeOut = isLast
    ? interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const opacity = fadeIn * fadeOut;

  // 入场微缩放
  const scaleIn = interpolate(frame, [0, CARD_VIDEO_OVERLAP], [1.03, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 标题弹入
  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const titleScale = interpolate(titleSpring, [0, 1], [0.5, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // 标题退出
  const titleFadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames - 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const glow = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.4, 1]);

  return (
    <AbsoluteFill style={{ opacity, background: "#000" }}>
      <Video
        src={staticFile(file)}
        muted
        playbackRate={playbackRate}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scaleIn})`,
        }}
      />

      {/* 底部渐变遮罩 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 300,
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
        }}
      />

      {/* 左上角：标题 + aiAct */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            opacity: titleOpacity * titleFadeOut,
            transform: `scale(${titleScale})`,
            transformOrigin: "top left",
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            padding: "12px 24px 12px 20px",
            borderRadius: 12,
            border: `1.5px solid ${color}44`,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 5,
              height: 48,
              borderRadius: 3,
              backgroundColor: color,
              boxShadow: `0 0 ${16 * glow}px ${color}88`,
            }}
          />
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              fontFamily: "sans-serif",
              color: "white",
              letterSpacing: 3,
              textShadow: `0 0 ${24 * glow}px ${color}88, 0 2px 8px rgba(0,0,0,0.5)`,
            }}
          >
            {title}
          </div>
        </div>

        {aiActText && aiActStartFrame !== undefined && (
          <TypewriterText
            text={aiActText}
            startFrame={aiActStartFrame}
            color={color}
          />
        )}
      </div>

      {/* 顶部高光 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent 10%, ${color} 50%, transparent 90%)`,
          opacity: glow * 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

// ============ 主合成 ============
export const PlatformShowcase = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("bgm.mp3")} volume={0.5} />
      {timeline.map((item) => {
        if (item.type === "card") {
          const v = videos[item.index];
          return (
            <Sequence
              key={`card-${item.index}`}
              from={item.start}
              durationInFrames={item.frames}
              layout="none"
            >
              <PlatformCard
                icon={v.icon}
                title={v.title}
                subtitle={v.subtitle}
                color={v.color}
              />
            </Sequence>
          );
        }

        const v = videos[item.index];
        const aiActStartFrame =
          v.aiActTime !== undefined
            ? Math.round((v.aiActTime / v.playbackRate) * FPS)
            : undefined;

        return (
          <Sequence
            key={`video-${item.index}`}
            from={item.start}
            durationInFrames={item.frames}
            layout="none"
          >
            <VideoSegment
              file={v.file}
              title={v.title}
              color={v.color}
              playbackRate={v.playbackRate}
              isLast={item.index === videos.length - 1}
              aiActStartFrame={aiActStartFrame}
              aiActText={v.aiActText}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
