import { patchLineKind } from "@/lib/messages/content";

export function PatchContent({ body }: { body: string }) {
  return (
    <pre className="patch-content" aria-label="Patch email content">
      {body.split("\n").map((line, index) => (
        <span className={`patch-content-line patch-content-${patchLineKind(line)}`} key={index}>
          {line || " "}
        </span>
      ))}
    </pre>
  );
}
