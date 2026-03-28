export const UPSELL_CONFIG: Record<string, { clinicalNote: string; preChecked: boolean }> = {
  ondansetron: {
    clinicalNote: "Clinically recommended — most GLP-1 patients experience nausea in the first 4 weeks.",
    preChecked: true,
  },
  "vitamin-b12": {
    clinicalNote: "Supports energy, metabolism, and nerve function. Popular with GLP-1 programs.",
    preChecked: false,
  },
  "nad-plus": {
    clinicalNote: "Boosts cellular energy and supports metabolic health. Our premium longevity injection.",
    preChecked: false,
  },
  "lipo-c": {
    clinicalNote: "Fat-burning injection blend — MIC + L-Carnitine. Designed to complement GLP-1 therapy.",
    preChecked: false,
  },
  "lipotropic-super-b": {
    clinicalNote: "11-ingredient energy + fat-burning injection — our most popular wellness add-on.",
    preChecked: false,
  },
  glutathione: {
    clinicalNote: "Master antioxidant — supports detox during weight loss and promotes skin radiance.",
    preChecked: false,
  },
  "l-carnitine": {
    clinicalNote: "Shuttles fat into cells for energy — supports fat burning and muscle preservation.",
    preChecked: false,
  },
  sermorelin: {
    clinicalNote: "Growth hormone peptide — combats muscle loss during weight loss, improves sleep and recovery.",
    preChecked: false,
  },
};
