// Type declarations for JSX node imports
declare module '*.jsx' {
  const node: any;
  export default node;
}

// Specific module declarations for our nodes
declare module './base/*' {
  const node: any;
  export default node;
}

declare module './math/*' {
  const node: any;
  export default node;
}

declare module './logic/*' {
  const node: any;
  export default node;
}

declare module './strings/*' {
  const node: any;
  export default node;
}

declare module './interface/*' {
  const node: any;
  export default node;
}