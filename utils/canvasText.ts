export const wrapAndFitText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  w: number,
  h: number,
  minFontSize: number = 8
): { fontSize: number; lines: string[] } => {
  let fontSize = h;
  let lines: string[] = [];

  while (fontSize > minFontSize) {
    ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
    const words = text.split(/\s+/);
    if (words.length === 0) return { fontSize, lines: [] };

    let maxPossibleLines = Math.floor((h * 0.92) / (fontSize * 1.2));
    if (maxPossibleLines < 1) maxPossibleLines = 1;
    let found = false;

    // Fast path: if the longest word is wider than the widest possible box, continue immediately.
    let possibleMaxW = w * 0.92;
    if (words.some(word => ctx.measureText(word).width > possibleMaxW)) {
      fontSize -= 2;
      continue;
    }

    for (let assumedLines = 1; assumedLines <= maxPossibleLines; assumedLines++) {
      const totalHeight = assumedLines * fontSize * 1.2;
      const startY = (h - totalHeight) / 2;

      let tempLines: string[] = [];
      let currentLine = words[0] || '';
      let currentLineIndex = 0;
      let canPack = true;

      const getAllowedWidth = (lineIndex: number) => {
        let ty = startY + lineIndex * fontSize * 1.2 + fontSize * 0.6;
        let fw = 0.15 * w * Math.abs(1 - 2 * ty / h);
        return Math.max(w * 0.92 - 2 * fw, 10); // always at least 10px to avoid infinite loops
      };

      if (ctx.measureText(currentLine).width > getAllowedWidth(0)) {
        canPack = false;
      }

      for (let i = 1; i < words.length && canPack; i++) {
        const allowedWidth = getAllowedWidth(currentLineIndex);

        if (ctx.measureText(currentLine + ' ' + words[i]).width <= allowedWidth) {
          currentLine += ' ' + words[i];
        } else {
          tempLines.push(currentLine);
          currentLineIndex++;
          currentLine = words[i];
          if (currentLineIndex >= assumedLines) {
            canPack = false;
            break;
          }
          if (ctx.measureText(currentLine).width > getAllowedWidth(currentLineIndex)) {
            canPack = false;
            break;
          }
        }
      }

      if (canPack) {
        tempLines.push(currentLine);
        if (tempLines.length <= assumedLines) {
          lines = tempLines;
          found = true;
          break;
        }
      }
    }

    if (found && lines.length * fontSize * 1.2 <= h * 0.92) {
      return { fontSize, lines };
    }

    fontSize -= 2;
  }

  // Fallback if we reach minFontSize
  ctx.font = `${minFontSize}px "${fontFamily}", sans-serif`;
  // Simple wrap
  let currentLine = '';
  lines = [];
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
     if (ctx.measureText(currentLine + ' ' + words[i]).width < w * 0.9) {
         currentLine += (currentLine ? ' ' : '') + words[i];
     } else {
         if (currentLine) lines.push(currentLine);
         currentLine = words[i];
     }
  }
  if (currentLine) lines.push(currentLine);
  
  return { fontSize: minFontSize, lines };
};
