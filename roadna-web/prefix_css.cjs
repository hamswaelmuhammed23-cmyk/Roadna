const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'style.css');
let c = fs.readFileSync(filePath, 'utf8');

const prefix = '.landing-page-root';

// Remove any existing .landing-page-root prefixes first to start clean
c = c.replace(new RegExp(prefix + ' ', 'g'), '');

const lines = c.split('\n');
let inKeyframes = false;
let braceDepth = 0;

const result = lines.map(line => {
  const trimmed = line.trim();
  ;l
  // Track keyframes to avoid prefixing inner percentages
  if (trimmed.startsWith('@keyframes')) {
    inKeyframes = true;
    braceDepth = 0;
    return line;
  }
  
  if (inKeyframes) {
    if (trimmed.includes('{')) braceDepth++;
    if (trimmed.includes('}')) braceDepth--;
    if (braceDepth === -1 || (braceDepth === 0 && trimmed === '}')) {
        inKeyframes = false;
    }
    return line;
  }

  // Prefix lines that start a CSS rule (contain {)
  // But avoid media queries and other @rules
  if (trimmed.includes('{') && !trimmed.startsWith('@')) {
    // If it's a selector like .class, #id, tag, *
    return `${prefix} ${line}`;
  }
  
  // Also prefix pseudo-classes/states if they are on their own line (rare but possible)
  if (trimmed.startsWith(':') && trimmed.includes('{')) {
    return `${prefix} ${line}`;
  }

  return line;
}).join('\n');

fs.writeFileSync(filePath, result);
console.log('Successfully scoped ALL styles in style.css to .landing-page-root');
