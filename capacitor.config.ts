import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.chessguy.mobile',
  appName: 'ChessGuy',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
