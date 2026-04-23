declare module "arabic-persian-reshaper" {
  export const PersianShaper: {
    convertArabic(value: string): string;
  };

  export const ArabicShaper: {
    convertArabic(value: string): string;
  };

  const reshaper: {
    PersianShaper: typeof PersianShaper;
    ArabicShaper: typeof ArabicShaper;
  };

  export default reshaper;
}
