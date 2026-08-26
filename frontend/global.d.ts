// Tells TypeScript that CSS files are valid imports.
// Next.js handles CSS at the build level — this declaration
// silences the false error in VS Code's TypeScript checker.
declare module "*.css";