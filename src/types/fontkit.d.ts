declare module "fontkit" {
  const fontkit: {
    create: (...args: unknown[]) => unknown;
    [key: string]: unknown;
  };

  export = fontkit;
}
