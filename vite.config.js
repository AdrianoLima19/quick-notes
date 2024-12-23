import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    base: "./",
    css: {
      preprocessorOptions: {
        sass: {
          api: "modern-compiler",
        },
        scss: {
          api: "modern-compiler",
        },
      },
    },
  };
});
