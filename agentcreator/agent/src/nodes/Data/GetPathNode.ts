import { BaseGetPathNode } from '@codebolt/agent-shared-nodes';

type PathPart = string | number;

export class GetPathNode extends BaseGetPathNode {
  static metadata = BaseGetPathNode.metadata;

  onAction() {
    this.onExecute();
  }

  onExecute() {
    const source = this.getInputData(1);
    const inputPath = this.getInputData(2);
    const path = typeof inputPath === "string" && inputPath.trim() ? inputPath : this.properties?.path ?? "";
    const defaultValue = this.getInputData(3) ?? this.properties?.defaultValue ?? null;
    const candidates = String(path || "")
      .split("|")
      .map((candidate) => candidate.trim())
      .filter(Boolean);
    const paths = candidates.length ? candidates : [""];
    const match = paths
      .map((candidate) => ({ candidate, ...getPathValue(source, parsePath(candidate)) }))
      .find((candidate) => candidate.found);
    const found = Boolean(match?.found);
    const value = match?.value;
    const outputValue = found ? value : defaultValue;

    this.setOutputData(1, outputValue);
    this.setOutputData(2, outputValue === null || outputValue === undefined ? "" : String(outputValue));
    this.setOutputData(3, typeof outputValue === "number" ? outputValue : Number(outputValue));
    this.setOutputData(4, Boolean(outputValue));
    this.setOutputData(5, found);
    this.setOutputData(6, match?.candidate ?? String(path || ""));
    this.triggerSlot(0, null, null);
  }
}

function parsePath(path: string): PathPart[] {
  if (!path.trim()) return [];
  const parts: PathPart[] = [];
  const re = /[^.[\]]+|\[(?:(-?\d+)|["']([^"']+)["'])\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(path))) {
    if (match[1] !== undefined) {
      parts.push(Number(match[1]));
    } else {
      parts.push(match[2] ?? match[0]);
    }
  }
  return parts;
}

function getPathValue(source: unknown, parts: PathPart[]) {
  if (parts.length === 0) return { found: source !== undefined, value: source };
  let current: any = source;
  for (const part of parts) {
    if (current === null || current === undefined) return { found: false, value: undefined };
    if (!(part in Object(current))) return { found: false, value: undefined };
    current = current[part as any];
  }
  return { found: true, value: current };
}
