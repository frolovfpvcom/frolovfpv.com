"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import GlassFolder, {
  type ArtRecipe,
  type GlassFolderProps,
} from "@/components/ui/glass-folder-cards";
import { ClipViewer, type ClipSelection } from "@/components/clip-viewer";
import { useLang, useT, type Lang } from "@/lib/lang";

const art = {
  gray: {
    style: "streak",
    colors: ["#f4f4f5", "#d4d4d8", "#a1a1aa", "#e4e4e7", "#71717a", "#fafafa"],
    scale: 0.7,
    warp: 1.6,
    angle: 0.4,
    gloss: 0.25,
  },
  green: {
    style: "marble",
    colors: ["#04110a", "#0c2a18", "#1f5a35", "#0a1a10", "#3f8a4f", "#8fcf86", "#d8f3c8"],
    scale: 0.7,
    warp: 3.4,
    angle: 2.1,
    gloss: 0.5,
    veins: 0.5,
  },
  pink: {
    style: "marble",
    colors: ["#fff1f5", "#fbcfe0", "#f472a6", "#5a1032", "#db2777", "#fda4c8", "#fff7fa"],
    scale: 0.72,
    warp: 3.2,
    angle: -0.4,
    gloss: 0.5,
    veins: 0.3,
  },
} satisfies Record<string, ArtRecipe>;

type Leaf = { x: number; y: number; size: number; rotate: number; color: string; opacity?: number };

function Leaves({ leaves }: { leaves: Leaf[] }) {
  return leaves.map((leaf, i) => (
    <svg
      key={i}
      viewBox="0 0 24 24"
      width={leaf.size}
      height={leaf.size}
      style={{
        position: "absolute",
        left: leaf.x,
        top: leaf.y,
        transform: `rotate(${leaf.rotate}deg)`,
        opacity: leaf.opacity ?? 1,
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))",
      }}
    >
      <path d="M12 1C5 6 4 14 12 23C20 14 19 6 12 1Z" fill={leaf.color} />
      <path
        d="M12 3V22M12 9l-3.5-2.5M12 9l3.5-2.5M12 14l-4-3M12 14l4-3M12 18.5l-3-2.5M12 18.5l3-2.5"
        stroke="rgba(0,0,0,.28)"
        strokeWidth=".7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  ));
}

// in back-panel units (340 × 272)
const backLeaves: Leaf[] = [
  { x: 210, y: 6, size: 54, rotate: 28, color: "#4f9a5c" },
  { x: 258, y: 26, size: 40, rotate: -18, color: "#7cc47f" },
  { x: 18, y: 40, size: 44, rotate: -40, color: "#3d7d48" },
  { x: 290, y: 90, size: 36, rotate: 70, color: "#a3d98f" },
];

// in front-panel units (340 × 198); kept clear of the bottom-left label
const frontLeaves: Leaf[] = [
  { x: 236, y: 40, size: 52, rotate: 38, color: "#5fae66" },
  { x: 284, y: 64, size: 36, rotate: -24, color: "#9fd88d" },
  { x: 200, y: 100, size: 30, rotate: 112, color: "#3f8a4f" },
  { x: 266, y: 120, size: 46, rotate: 150, color: "#78c27a" },
  { x: 150, y: 44, size: 24, rotate: -60, color: "#b9e6a6", opacity: 0.85 },
  { x: 30, y: 10, size: 28, rotate: -30, color: "#6cba70", opacity: 0.9 },
];

type Folder = GlassFolderProps & { label: string };

const foldersByLang = (lang: Lang): Folder[] => [
  {
    label: "Surfin’",
    meta: lang === "da" ? "Reklame · 3 klip" : "Commercial · 3 clips",
    tone: "light",
    glass: "#d9d9dd",
    art: art.gray,
    seed: 4,
    files: [
      { name: "Peugeot shenanigans", meta: "4K", video: "/clips/peugeot/klip-3.mp4", image: "/clips/peugeot/klip-3.jpg" },
      { name: "Peugeot shenanigans", meta: "4K", video: "/clips/peugeot/klip-2.mp4", image: "/clips/peugeot/klip-2.jpg" },
      // last in the list = front of the folder and first in the opened stack
      { name: "Peugeot shenanigans", meta: "4K", video: "/clips/peugeot/klip-1.mp4", image: "/clips/peugeot/klip-1.jpg" },
    ],
  },
  {
    label: lang === "da" ? "Natur" : "Nature",
    meta: lang === "da" ? "Natur · 3 klip" : "Nature · 3 clips",
    tone: "dark",
    glass: "#0c2a18",
    art: art.green,
    seed: 7,
    backDecor: <Leaves leaves={backLeaves} />,
    frontDecor: <Leaves leaves={frontLeaves} />,
    files: [
      { name: lang === "da" ? "Gennem parken" : "Through the park", blank: true },
      { name: lang === "da" ? "Nattelys" : "Night lights", blank: true },
      // last in the list = front of the folder and first in the opened stack
      { name: "Panoram", meta: "4K · 0:33", video: "/clips/panoram.mp4", image: "/clips/panoram.jpg" },
    ],
  },
  {
    label: "Whoopin’",
    meta: lang === "da" ? "Hav · 3 klip" : "Sea · 3 clips",
    tone: "light",
    glass: "#f9c4d8",
    art: art.pink,
    seed: 2,
    files: [
      { name: lang === "da" ? "Klippekant" : "Cliff edge", blank: true },
      { name: lang === "da" ? "Surf i solnedgang" : "Sunset surf", blank: true },
      { name: lang === "da" ? "Tidevandshuller" : "Tide pools", blank: true },
    ],
  },
];

const MAX_FOLDER_WIDTH = 153;

/** Fits the folder to its grid cell; the component itself takes a fixed px width. */
function FolderCell({
  folder,
  onOpenClip,
}: {
  folder: Folder;
  onOpenClip: (clip: ClipSelection) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MAX_FOLDER_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.min(el.clientWidth, MAX_FOLDER_WIDTH)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex w-full justify-center">
      <GlassFolder
        {...folder}
        action="none"
        width={width}
        appear={false}
        raised
        layout="stack"
        onFileSelect={(_, index, el) =>
          onOpenClip({ files: folder.files ?? [], index, folder: folder.label, origin: el })
        }
      />
    </div>
  );
}

export function Work() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const [clip, setClip] = useState<ClipSelection | null>(null);
  const { lang } = useLang();
  const folders = foldersByLang(lang);
  const t = useT({
    da: { title: "Klip fra arkivet", lead: "En samling af flyvninger og historier fanget fra unikke perspektiver." },
    en: { title: "From the archive", lead: "A collection of flights and stories captured from unique perspectives." },
  });

  return (
    <section id="work" className="py-24 px-6 md:py-32">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-ild-600">{t.title}</p>
          <p className="mx-auto mt-3 max-w-md text-lg text-skov-950/70">{t.lead}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-24">
          {folders.map((folder) => (
            <FolderCell key={folder.seed} folder={folder} onOpenClip={setClip} />
          ))}
        </div>
      </div>
      <ClipViewer selection={clip} onClose={() => setClip(null)} />
    </section>
  );
}
