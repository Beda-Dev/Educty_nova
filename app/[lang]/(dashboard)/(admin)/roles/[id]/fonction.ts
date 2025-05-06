export function comparaisonChaine(str1: string, str2: string): boolean {
    const normalizeString = (str: string): string => {
      return str
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
    };
  
    return normalizeString(str1) === normalizeString(str2);
  }

