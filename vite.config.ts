import react from '@vitejs/plugin-react'
import { defineConfig, Plugin } from 'vite'

// カスタムプラグインを作成して環境変数を注入
function injectEnvPlugin(): Plugin {
  return {
    name: 'inject-env',
    transformIndexHtml(html) {
      return html.replace(
        '<!--app-auth-password-->',
        process.env.VITE_AUTH_PASSWORD || ''
      )
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), injectEnvPlugin()],
  base: './', // GitHub Pages用に相対パスを設定
})
