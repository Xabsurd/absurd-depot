import presetUno from '@unocss/preset-uno';
import { defineConfig } from 'unocss';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerDirectives()],
  theme: {
    // ...
    breakpoints: {
      xs: '576px',
      sm: '640px',
      md: '768px',
      lg: '992px',
      xl: '1200px'
    }
  }
});
