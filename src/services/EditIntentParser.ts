import type { EditIntent, EditOperation } from "../types/editing";

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

function detectOperation(prompt: string): EditOperation {
  const p = prompt.toLowerCase();

  if (/\b(remove|erase|delete|take out|get rid of)\b/.test(p)) return "remove";
  if (/\b(replace|swap)\b/.test(p)) return "replace";
  if (/\b(add|insert|put|include)\b/.test(p)) return "add";
  if (/\b(change|convert)\b/.test(p) || /\bmake\b.+\binto\b/.test(p) || /\bturn\b.+\binto\b/.test(p)) {
    return "change";
  }
  if (/\b(transform|restyle|stylize|vectorize)\b/.test(p)) return "transform";
  if (/\b(clean up|cleanup|fix|repair|retouch)\b/.test(p)) return "cleanup";

  return "unknown";
}

function cleanExtractedValue(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const cleaned = value
    .trim()
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .replace(/\b(please|thanks|thank you)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || undefined;
}

function extractTarget(prompt: string, operation: EditOperation): string | undefined {
  const p = prompt.trim();

  const patterns: RegExp[] = (() => {
    switch (operation) {
      case "remove":
        return [
          /remove\s+the\s+(.+)$/i,
          /remove\s+(.+)$/i,
          /delete\s+the\s+(.+)$/i,
          /delete\s+(.+)$/i,
          /erase\s+the\s+(.+)$/i,
          /erase\s+(.+)$/i,
          /take out\s+the\s+(.+)$/i,
          /take out\s+(.+)$/i,
          /get rid of\s+the\s+(.+)$/i,
          /get rid of\s+(.+)$/i,
        ];
      case "replace":
        return [
          /replace\s+the\s+(.+?)\s+with\s+(.+)$/i,
          /replace\s+(.+?)\s+with\s+(.+)$/i,
          /swap\s+the\s+(.+?)\s+with\s+(.+)$/i,
          /swap\s+(.+?)\s+with\s+(.+)$/i,
        ];
      case "add":
        return [
          /add\s+(.+)$/i,
          /insert\s+(.+)$/i,
          /include\s+(.+)$/i,
          /put\s+(.+)$/i,
        ];
      case "change":
        return [
          /change\s+the\s+(.+?)\s+to\s+(.+)$/i,
          /change\s+(.+?)\s+to\s+(.+)$/i,
          /make\s+the\s+(.+?)\s+into\s+(.+)$/i,
          /make\s+(.+?)\s+into\s+(.+)$/i,
          /turn\s+the\s+(.+?)\s+into\s+(.+)$/i,
          /turn\s+(.+?)\s+into\s+(.+)$/i,
          /convert\s+the\s+(.+?)\s+to\s+(.+)$/i,
          /convert\s+(.+?)\s+to\s+(.+)$/i,
        ];
      default:
        return [];
    }
  })();

  for (const pattern of patterns) {
    const match = p.match(pattern);
    if (match?.[1]) return cleanExtractedValue(match[1]);
  }

  return undefined;
}

function extractReplacement(prompt: string, operation: EditOperation): string | undefined {
  if (operation !== "replace" && operation !== "change") return undefined;

  const p = prompt.trim();
  const patterns = [
    /replace\s+the\s+.+?\s+with\s+(.+)$/i,
    /replace\s+.+?\s+with\s+(.+)$/i,
    /swap\s+the\s+.+?\s+with\s+(.+)$/i,
    /swap\s+.+?\s+with\s+(.+)$/i,
    /change\s+the\s+.+?\s+to\s+(.+)$/i,
    /change\s+.+?\s+to\s+(.+)$/i,
    /make\s+the\s+.+?\s+into\s+(.+)$/i,
    /make\s+.+?\s+into\s+(.+)$/i,
    /turn\s+the\s+.+?\s+into\s+(.+)$/i,
    /turn\s+.+?\s+into\s+(.+)$/i,
    /convert\s+the\s+.+?\s+to\s+(.+)$/i,
    /convert\s+.+?\s+to\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = p.match(pattern);
    if (match?.[1]) return cleanExtractedValue(match[1]);
  }

  return undefined;
}

function extractStyleTarget(prompt: string, operation: EditOperation): string | undefined {
  if (operation !== "transform") return undefined;

  const patterns = [
    /(?:transform|restyle|stylize|vectorize)\s+(?:the\s+image\s+)?(?:into|as|to)?\s*(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match?.[1]) return cleanExtractedValue(match[1]);
  }

  return undefined;
}

function detectPreservationFlags(prompt: string): Pick<EditIntent, "preserveComposition" | "preserveIdentity" | "preserveLayout"> {
  const p = prompt.toLowerCase();

  const explicitlyChangeComposition =
    /\b(change|alter|move|recompose|rearrange|reframe|crop|zoom out|zoom in|wide shot|close-up)\b/.test(p);

  const explicitlyChangeIdentity =
    /\b(change face|change identity|different person|another person|turn .* into someone else|make .* a different character)\b/.test(p);

  const explicitlyChangeLayout =
    /\b(change layout|rearrange|reposition|move to the left|move to the right|move to the center|stack vertically|horizontal layout)\b/.test(p);

  return {
    preserveComposition: !explicitlyChangeComposition,
    preserveIdentity: !explicitlyChangeIdentity,
    preserveLayout: !explicitlyChangeLayout,
  };
}

export function parseEditIntent(rawPrompt: string): EditIntent {
  const prompt = normalize(rawPrompt);
  const operation = detectOperation(prompt);
  const target = extractTarget(prompt, operation);
  const replacement = extractReplacement(prompt, operation);
  const styleTarget = extractStyleTarget(prompt, operation);
  const preservationFlags = detectPreservationFlags(prompt);

  return {
    isEditRequest: operation !== "unknown",
    operation,
    target,
    replacement,
    styleTarget,
    preserveComposition: preservationFlags.preserveComposition,
    preserveIdentity: preservationFlags.preserveIdentity,
    preserveLayout: preservationFlags.preserveLayout,
    rawPrompt: prompt,
  };
}