declare module 'react-native-cheerio' {
  export function load(html: string): CheerioStatic;
  
  interface CheerioStatic {
    (selector: string): CheerioElement;
    html(): string;
  }
  
  interface CheerioElement {
    length: number;
    text(): string;
    attr(name: string): string | undefined;
    find(selector: string): CheerioElement;
    html(): string;
    eq(index: number): CheerioElement;
    each(func: (index: number, element: any) => void): CheerioElement;
  }
} 