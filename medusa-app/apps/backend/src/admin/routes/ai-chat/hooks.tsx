export function parseMedusaMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    let currentLine = line.trim();
    if (!currentLine) return <div key={index} className="h-2" />;

    if (currentLine.startsWith("#")) {
      const depth = (currentLine.match(/^#+/) || [""])[0].length;
      const cleanText = currentLine.replace(/^#+\s*/, "");
      const classes =
        depth === 1
          ? "text-base font-semibold text-ui-fg-base mb-2 mt-3"
          : "text-xs font-medium text-ui-fg-muted uppercase tracking-wider mt-3 mb-1";
      return (
        <h4 key={index} className={classes}>
          {cleanText}
        </h4>
      );
    }

    const isBullet = currentLine.startsWith("-") || currentLine.startsWith("*");
    if (isBullet) currentLine = currentLine.replace(/^[-*]\s*/, "");

    const parts = currentLine.split(/(\*\*.*?\*\*)/g);
    const formattedText = parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={pIdx} className="font-medium text-ui-fg-base">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <div
          key={index}
          className="flex items-start gap-2 ml-1 my-1 text-ui-fg-subtle"
        >
          <span className="mt-2 w-1 h-1 rounded-full bg-ui-border-strong flex-shrink-0" />
          <span className="flex-1 text-sm">{formattedText}</span>
        </div>
      );
    }

    return (
      <p key={index} className="text-sm text-ui-fg-subtle my-1 leading-relaxed">
        {formattedText}
      </p>
    );
  });
}
