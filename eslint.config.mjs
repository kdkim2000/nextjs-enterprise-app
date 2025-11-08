import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "public/**",
    "dist/**",
    "backend/**", // Backend uses CommonJS, not ES modules
  ]),
  // Custom rules - 초보자 친화적 설정 (warn 레벨로 완화)
  {
    rules: {
      // Console rules - console.log 사용 허용
      "no-console": "off",

      // TypeScript rules - 엄격함 완화
      "@typescript-eslint/no-unused-vars": [
        "warn", // error → warn으로 변경
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true, // 구조 분해 할당에서 남은 속성 무시
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // any 타입 사용 허용

      // General code quality - 경고로만 표시
      "prefer-const": "warn", // error → warn
      "no-var": "warn", // error → warn
      "eqeqeq": "off", // == 사용 허용

      // React/Next.js 관련 규칙 완화
      "react/no-unescaped-entities": "off", // 이스케이프되지 않은 문자 허용
      "react-hooks/exhaustive-deps": "warn", // useEffect 의존성 경고만 표시
      "@next/next/no-img-element": "warn", // img 태그 사용 경고만 표시
    },
  },
]);

export default eslintConfig;
