import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.devdavidg.gastos",
  appName: "AstroGastos",
  webDir: "dist",
  server: {
    url: "https://devdavidg.github.io/astro-gastos/",
    cleartext: true,
  },
};

export default config;
