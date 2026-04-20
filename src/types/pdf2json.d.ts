declare module "pdf2json" {
  export default class PDFParser {
    constructor(context?: unknown, verbosity?: number);
    parseBuffer(buffer: Buffer): void;
    getRawTextContent(): string;
    on(event: "pdfParser_dataReady", listener: (pdfData: unknown) => void): this;
    on(
      event: "pdfParser_dataError",
      listener: (error: { parserError: Error }) => void,
    ): this;
  }
}
