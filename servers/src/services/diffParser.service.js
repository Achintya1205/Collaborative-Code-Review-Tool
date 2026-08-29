function parseDiff(rawDiff) {
  if (!rawDiff || typeof rawDiff !== 'string') {
    return [];
  }

  const lines = rawDiff.split('\n');
  const files = [];

  let currentFile = null;
  let currentHunk = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;
  let pendingOldPath = null;
  let pendingNewPath = null;

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      currentFile = {
        oldPath: match ? match[1] : 'unknown',
        newPath: match ? match[2] : 'unknown',
        hunks: [],
      };
      files.push(currentFile);
      currentHunk = null;
      pendingOldPath = null;
      pendingNewPath = null;
      continue;
    }

    if (line.startsWith('--- ')) {
      pendingOldPath = line.slice(4).replace(/^a\//, '').trim();
      continue;
    }
    if (line.startsWith('+++ ')) {
      pendingNewPath = line.slice(4).replace(/^b\//, '').trim();
      continue;
    }
    if (line.startsWith('@@')) {
      const hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/);
      if (!hunkMatch) continue;

      if (!currentFile) {
        currentFile = {
          oldPath: pendingOldPath || 'unknown',
          newPath: pendingNewPath || 'unknown',
          hunks: [],
        };
        files.push(currentFile);
      }

      oldLineNumber = parseInt(hunkMatch[1], 10);
      newLineNumber = parseInt(hunkMatch[3], 10);
      currentHunk = {
        header: line.trim(),
        lines: [],
      };
      currentFile.hunks.push(currentHunk);
      continue;
    }

    if (!currentHunk) continue;

    if (line.startsWith('+')) {
      currentHunk.lines.push({
        type: 'added',
        content: line.slice(1),
        oldLineNumber: null,
        newLineNumber,
      });
      newLineNumber++;
    } else if (line.startsWith('-')) {
      currentHunk.lines.push({
        type: 'removed',
        content: line.slice(1),
        oldLineNumber,
        newLineNumber: null,
      });
      oldLineNumber++;
    } else {
      const content = line.startsWith(' ') ? line.slice(1) : line;
      currentHunk.lines.push({
        type: 'context',
        content,
        oldLineNumber,
        newLineNumber,
      });
      oldLineNumber++;
      newLineNumber++;
    }
  }

  return files;
}

module.exports = { parseDiff };