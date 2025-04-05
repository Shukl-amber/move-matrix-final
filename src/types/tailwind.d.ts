declare module 'tailwindcss/lib/util/flattenColorPalette' {
  export default function flattenColorPalette(colors: object): { [key: string]: string };
}

declare module 'tailwindcss' {
  export interface PluginAPI {
    matchUtilities: any;
    theme: any;
    addBase: any;
  }
  
  export interface Config {
    darkMode?: string | string[];
    content?: string | string[];
    prefix?: string;
    theme?: any;
    plugins?: any[];
  }
} 