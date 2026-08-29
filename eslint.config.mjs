import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "dist/**"],
  },
  ...nextConfig,
];

export default eslintConfig;

