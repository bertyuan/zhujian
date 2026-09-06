export type PatchLineKind = "context" | "added" | "removed" | "header";

const HEADER_PREFIXES = [
  "diff --git ",
  "index ",
  "--- ",
  "+++ ",
  "@@ ",
  "new file mode ",
  "deleted file mode ",
  "old mode ",
  "new mode ",
  "similarity index ",
  "dissimilarity index ",
  "rename from ",
  "rename to ",
  "copy from ",
  "copy to ",
];

export function patchLineKind(line: string): PatchLineKind {
  if (HEADER_PREFIXES.some((prefix) => line.startsWith(prefix))) return "header";
  if (line.startsWith("+") && !line.startsWith("+++")) return "added";
  if (line.startsWith("-") && !line.startsWith("---") && line.trim() !== "--") return "removed";
  return "context";
}
