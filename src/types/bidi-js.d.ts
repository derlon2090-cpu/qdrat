declare module "bidi-js" {
  type EmbeddingLevelsResult = {
    levels: Uint8Array;
    paragraphs: Array<{
      start: number;
      end: number;
      level: number;
    }>;
  };

  type BidiJsInstance = {
    getEmbeddingLevels(text: string, explicitDirection?: "ltr" | "rtl"): EmbeddingLevelsResult;
    getReorderedString(
      text: string,
      embeddingLevelsResult: EmbeddingLevelsResult,
      start?: number,
      end?: number,
    ): string;
  };

  export default function bidiFactory(): BidiJsInstance;
}
