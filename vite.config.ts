import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pages用に相対パスを設定
  define: {
    // HTMLファイル内の環境変数プレースホルダーを置換
    '%VITE_AUTH_PASSWORD%': JSON.stringify(process.env.VITE_AUTH_PASSWORD)
  }
})
