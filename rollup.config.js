import terser from "@rollup/plugin-terser";
import pkg from "./package.json" assert { type: "json" };

export default [
  {
    input: "src/render.js",
    output: [{ name: "render", file: pkg.module, format: "es" }],
    // plugins: [
    //   terser()
    // ],
  },
];
