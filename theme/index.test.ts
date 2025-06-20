/// <reference lib="dom" />

import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { 
  createTheme, 
  applyTheme, 
  getTheme, 
  resetTheme,
  validateTheme,
  mergeThemes,
  getAvailableThemes,
  switchTheme,
  type Theme,
  type ThemeConfig,
  type ColorPalette,
  type Typography,
  type Spacing
} from './index';

// Mock DOM environment setup
const originalDocument = global.document;

describe('Theme Creation', () => {
  test('should create a theme with complete configuration', () => {
    const config: ThemeConfig = {
      name: 'custom-theme',
      colors: {
        primary: '#0066cc',
        secondary: '#6c757d',
        background: '#ffffff',
        foreground: '#212529',
        accent: '#fd7e14',
        muted: '#6c757d',
        border: '#dee2e6'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    };
    
    const theme = createTheme(config);
    expect(theme).toBeDefined();
    expect(theme.name).toBe('custom-theme');
    expect(theme.colors.primary).toBe('#0066cc');
    expect(theme.typography.fontFamily).toBe('Inter, system-ui, sans-serif');
    expect(theme.spacing.md).toBe('1rem');
  });

  test('should create theme with partial configuration using defaults', () => {
    const partialConfig = {
      name: 'minimal-theme',
      colors: {
        primary: '#ff0000',
        background: '#f8f9fa'
      }
    };
    
    const theme = createTheme(partialConfig);
    expect(theme.name).toBe('minimal-theme');
    expect(theme.colors.primary).toBe('#ff0000');
    expect(theme.colors.background).toBe('#f8f9fa');
    expect(theme.colors.secondary).toBeDefined(); // Should have default
    expect(theme.typography).toBeDefined(); // Should have defaults
    expect(theme.spacing).toBeDefined(); // Should have defaults
  });

  test('should throw error for invalid color values', () => {
    const invalidConfig = {
      colors: {
        primary: 'not-a-valid-color',
        background: '#ffffff'
      }
    };
    
    expect(() => createTheme(invalidConfig as any)).toThrow('Invalid color format');
  });

  test('should throw error for empty theme name', () => {
    const invalidConfig = {
      name: '',
      colors: { primary: '#0066cc' }
    };
    
    expect(() => createTheme(invalidConfig as any)).toThrow('Theme name cannot be empty');
  });
});

describe('Theme Application', () => {
  beforeEach(() => {
    if (global.document) {
      document.head.innerHTML = '';
      document.body.className = '';
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.cssText = '';
    }
  });

  afterEach(() => {
    resetTheme();
  });

  test('should apply theme to DOM with CSS custom properties', () => {
    const theme = createTheme({
      name: 'test-theme',
      colors: { 
        primary: '#0066cc', 
        background: '#ffffff',
        foreground: '#212529'
      },
      spacing: { md: '1rem', lg: '1.5rem' }
    } as ThemeConfig);
    
    applyTheme(theme);
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('test-theme');
    
    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue('--color-primary')).toBe('#0066cc');
    expect(rootStyle.getPropertyValue('--color-background')).toBe('#ffffff');
    expect(rootStyle.getPropertyValue('--spacing-md')).toBe('1rem');
  });

  test('should retrieve currently applied theme', () => {
    const originalTheme = createTheme({
      name: 'retrieve-test',
      colors: { primary: '#0066cc', background: '#ffffff' }
    } as ThemeConfig);
    
    applyTheme(originalTheme);
    const retrievedTheme = getTheme();
    
    expect(retrievedTheme).toEqual(originalTheme);
    expect(retrievedTheme.name).toBe('retrieve-test');
  });

  test('should return default theme when no theme is applied', () => {
    const currentTheme = getTheme();
    expect(currentTheme).toBeDefined();
    expect(currentTheme.name).toBe('default');
    expect(currentTheme.colors.primary).toBeDefined();
  });

  test('should handle theme switching', () => {
    const theme1 = createTheme({
      name: 'theme-1',
      colors: { primary: '#ff0000' }
    } as ThemeConfig);
    
    const theme2 = createTheme({
      name: 'theme-2', 
      colors: { primary: '#00ff00' }
    } as ThemeConfig);
    
    switchTheme('theme-1');
    expect(getTheme().colors.primary).toBe('#ff0000');
    
    switchTheme('theme-2');
    expect(getTheme().colors.primary).toBe('#00ff00');
    expect(document.documentElement.getAttribute('data-theme')).toBe('theme-2');
  });

  test('should apply theme without DOM gracefully', () => {
    const originalDoc = global.document;
    // @ts-ignore
    delete global.document;
    
    const theme = createTheme({
      name: 'no-dom-theme',
      colors: { primary: '#0066cc' }
    } as ThemeConfig);
    
    expect(() => applyTheme(theme)).not.toThrow();
    
    global.document = originalDoc;
  });
});

describe('Theme Validation', () => {
  test('should validate complete valid theme', () => {
    const validTheme = {
      name: 'valid-theme',
      colors: {
        primary: '#0066cc',
        secondary: '#6c757d',
        background: '#ffffff',
        foreground: '#212529',
        accent: '#fd7e14'
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: { base: '1rem', lg: '1.25rem' }
      },
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem'
      }
    } as Theme;
    
    expect(validateTheme(validTheme)).toBe(true);
  });

  test('should reject theme with invalid hex color', () => {
    const invalidTheme = {
      name: 'invalid-color-theme',
      colors: {
        primary: '#invalid',
        background: '#ffffff'
      }
    } as any;
    
    expect(validateTheme(invalidTheme)).toBe(false);
  });

  test('should reject theme with invalid RGB color', () => {
    const invalidTheme = {
      colors: {
        primary: 'rgb(256, 100, 50)', // Invalid RGB value
        background: '#ffffff'
      }
    } as any;
    
    expect(validateTheme(invalidTheme)).toBe(false);
  });

  test('should accept theme with various valid color formats', () => {
    const validTheme = {
      colors: {
        primary: '#0066cc',
        secondary: 'rgb(108, 117, 125)',
        accent: 'hsl(210, 100%, 40%)',
        background: 'white',
        foreground: '#212529'
      }
    } as any;
    
    expect(validateTheme(validTheme)).toBe(true);
  });

  test('should reject theme with missing required colors', () => {
    const incompleteTheme = {
      colors: {
        primary: '#0066cc'
        // Missing required background and foreground colors
      }
    } as any;
    
    expect(validateTheme(incompleteTheme)).toBe(false);
  });

  test('should validate theme with nested color variants', () => {
    const themeWithVariants = {
      colors: {
        primary: {
          main: '#0066cc',
          light: '#3385d6',
          dark: '#004499',
          contrastText: '#ffffff'
        },
        secondary: '#6c757d',
        background: '#ffffff',
        foreground: '#212529'
      }
    } as any;
    
    expect(validateTheme(themeWithVariants)).toBe(true);
  });

  test('should reject theme with invalid spacing values', () => {
    const invalidTheme = {
      colors: {
        primary: '#0066cc',
        background: '#ffffff',
        foreground: '#212529'
      },
      spacing: {
        sm: 'invalid-spacing',
        md: '1rem'
      }
    } as any;
    
    expect(validateTheme(invalidTheme)).toBe(false);
  });
});

describe('Theme Merging', () => {
  test('should merge two themes with deep merging', () => {
    const baseTheme = {
      name: 'base-theme',
      colors: { 
        primary: '#0066cc', 
        secondary: '#6c757d',
        background: '#ffffff'
      },
      typography: { 
        fontFamily: 'Arial, sans-serif',
        fontSize: { base: '1rem' }
      },
      spacing: { sm: '0.5rem', md: '1rem' }
    } as Theme;
    
    const overrideTheme = {
      name: 'override-theme',
      colors: { 
        primary: '#ff0000',
        accent: '#fd7e14'
      },
      typography: {
        fontSize: { lg: '1.25rem' }
      },
      spacing: { lg: '1.5rem' }
    } as Theme;
    
    const merged = mergeThemes(baseTheme, overrideTheme);
    
    expect(merged.name).toBe('override-theme');
    expect(merged.colors.primary).toBe('#ff0000');
    expect(merged.colors.secondary).toBe('#6c757d');
    expect(merged.colors.accent).toBe('#fd7e14');
    expect(merged.typography.fontFamily).toBe('Arial, sans-serif');
    expect(merged.typography.fontSize.base).toBe('1rem');
    expect(merged.typography.fontSize.lg).toBe('1.25rem');
    expect(merged.spacing.md).toBe('1rem');
    expect(merged.spacing.lg).toBe('1.5rem');
  });

  test('should handle deep merging of nested color objects', () => {
    const theme1 = {
      colors: {
        primary: {
          main: '#0066cc',
          light: '#3385d6',
          variants: { 50: '#e3f2fd', 100: '#bbdefb' }
        },
        secondary: '#6c757d'
      }
    } as any;
    
    const theme2 = {
      colors: {
        primary: {
          dark: '#004499',
          variants: { 200: '#90caf9', 300: '#64b5f6' }
        }
      }
    } as any;
    
    const merged = mergeThemes(theme1, theme2);
    
    expect(merged.colors.primary.main).toBe('#0066cc');
    expect(merged.colors.primary.light).toBe('#3385d6');
    expect(merged.colors.primary.dark).toBe('#004499');
    expect(merged.colors.primary.variants[50]).toBe('#e3f2fd');
    expect(merged.colors.primary.variants[200]).toBe('#90caf9');
    expect(merged.colors.secondary).toBe('#6c757d');
  });

  test('should handle merging with null, undefined, or empty themes', () => {
    const validTheme = { 
      name: 'valid',
      colors: { primary: '#0066cc', background: '#ffffff' } 
    } as Theme;
    
    expect(mergeThemes(validTheme, null)).toEqual(validTheme);
    expect(mergeThemes(validTheme, undefined)).toEqual(validTheme);
    expect(mergeThemes(null, validTheme)).toEqual(validTheme);
    expect(mergeThemes(validTheme, {} as any)).toEqual(validTheme);
  });

  test('should merge multiple themes in sequence', () => {
    const base = { colors: { primary: '#000000' } } as any;
    const override1 = { colors: { secondary: '#111111' } } as any;
    const override2 = { colors: { accent: '#222222' } } as any;
    
    const result = mergeThemes(mergeThemes(base, override1), override2);
    
    expect(result.colors.primary).toBe('#000000');
    expect(result.colors.secondary).toBe('#111111');
    expect(result.colors.accent).toBe('#222222');
  });
});

describe('Theme Management', () => {
  beforeEach(() => {
    resetTheme();
  });

  test('should get list of available themes', () => {
    createTheme({ name: 'light', colors: { primary: '#0066cc' } } as ThemeConfig);
    createTheme({ name: 'dark', colors: { primary: '#ffffff' } } as ThemeConfig);
    createTheme({ name: 'custom', colors: { primary: '#ff0000' } } as ThemeConfig);
    
    const availableThemes = getAvailableThemes();
    
    expect(availableThemes).toContain('light');
    expect(availableThemes).toContain('dark');
    expect(availableThemes).toContain('custom');
    expect(availableThemes.length).toBeGreaterThanOrEqual(3);
  });

  test('should switch between themes by name', () => {
    createTheme({ 
      name: 'theme-a', 
      colors: { primary: '#ff0000', background: '#ffffff' } 
    } as ThemeConfig);
    createTheme({ 
      name: 'theme-b', 
      colors: { primary: '#00ff00', background: '#000000' } 
    } as ThemeConfig);
    
    switchTheme('theme-a');
    expect(getTheme().name).toBe('theme-a');
    expect(getTheme().colors.primary).toBe('#ff0000');
    
    switchTheme('theme-b');
    expect(getTheme().name).toBe('theme-b');
    expect(getTheme().colors.primary).toBe('#00ff00');
  });

  test('should throw error when switching to non-existent theme', () => {
    expect(() => switchTheme('non-existent-theme')).toThrow('Theme "non-existent-theme" not found');
  });

  test('should reset theme to default state', () => {
    const customTheme = createTheme({
      name: 'custom-reset-test',
      colors: { primary: '#ff0000', background: '#000000' }
    } as ThemeConfig);
    
    applyTheme(customTheme);
    expect(getTheme().name).toBe('custom-reset-test');
    
    resetTheme();
    const defaultTheme = getTheme();
    expect(defaultTheme.name).toBe('default');
    expect(defaultTheme.colors.primary).not.toBe('#ff0000');
    expect(document.documentElement.getAttribute('data-theme')).toBe('default');
  });

  test('should handle theme persistence and retrieval', () => {
    const persistentTheme = createTheme({
      name: 'persistent-theme',
      colors: { primary: '#8b5cf6', background: '#fafafa' }
    } as ThemeConfig);
    
    applyTheme(persistentTheme);
    
    // Simulate page reload by resetting and retrieving
    const retrievedTheme = getTheme();
    expect(retrievedTheme.name).toBe('persistent-theme');
    expect(retrievedTheme.colors.primary).toBe('#8b5cf6');
  });
});

describe('Performance and Edge Cases', () => {
  test('should handle large theme configurations efficiently', () => {
    const largeConfig = {
      name: 'large-theme',
      colors: Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => 
          [`color${i}`, `#${i.toString(16).padStart(6, '0')}`]
        )
      ),
      spacing: Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => 
          [`spacing${i}`, `${i * 4}px`]
        )
      ),
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: Object.fromEntries(
          Array.from({ length: 20 }, (_, i) => 
            [`size${i}`, `${0.75 + i * 0.125}rem`]
          )
        )
      }
    } as any;
    
    const startTime = performance.now();
    const theme = createTheme(largeConfig);
    const endTime = performance.now();
    
    expect(theme).toBeDefined();
    expect(theme.name).toBe('large-theme');
    expect(Object.keys(theme.colors)).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
  });

  test('should handle rapid theme switching without memory leaks', () => {
    const themes = Array.from({ length: 20 }, (_, i) => 
      createTheme({ 
        name: `rapid-theme-${i}`,
        colors: { 
          primary: `#${(i * 17).toString(16).padStart(6, '0')}`,
          background: '#ffffff'
        }
      } as ThemeConfig)
    );
    
    themes.forEach((theme, index) => {
      switchTheme(`rapid-theme-${index}`);
      expect(getTheme().name).toBe(`rapid-theme-${index}`);
      
      const themeElements = document.querySelectorAll('[data-theme]');
      expect(themeElements.length).toBeLessThanOrEqual(1);
    });
  });

  test('should maintain theme consistency across operations', () => {
    const originalTheme = createTheme({
      name: 'consistency-test',
      colors: { 
        primary: '#0066cc', 
        secondary: '#6c757d',
        background: '#ffffff',
        foreground: '#212529'
      },
      spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem' }
    } as ThemeConfig);
    
    for (let i = 0; i < 5; i++) {
      applyTheme(originalTheme);
      const retrieved = getTheme();
      expect(retrieved).toEqual(originalTheme);
    }
  });

  test('should handle theme operations with malformed data gracefully', () => {
    const malformedInputs = [
      null,
      undefined,
      '',
      123,
      [],
      { colors: null },
      { colors: { primary: null } },
      { name: null, colors: { primary: '#0066cc' } }
    ];
    
    malformedInputs.forEach(input => {
      expect(() => createTheme(input as any)).not.toThrow();
    });
  });

  test('should preserve theme state during DOM manipulation', () => {
    const theme = createTheme({
      name: 'dom-manipulation-test',
      colors: { primary: '#0066cc', background: '#ffffff' }
    } as ThemeConfig);
    
    applyTheme(theme);
    
    // Simulate DOM changes
    document.head.innerHTML += '<style>body { margin: 0; }</style>';
    document.body.className = 'test-class';
    
    expect(getTheme()).toEqual(theme);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dom-manipulation-test');
  });
});