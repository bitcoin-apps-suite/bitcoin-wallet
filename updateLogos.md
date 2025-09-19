# Logo Update Instructions

To complete the branding update with your new Bitcoin wallet logo:

1. **Save your logo image** as the following files:
   - `/public/bitcoin-wallet-logo.png` (main logo)
   - `/public/icons/icon16.png` (16x16 for extension icon)
   - `/public/icons/icon48.png` (48x48 for extension icon)
   - `/public/icons/icon128.png` (128x128 for extension icon)
   - `/public/icons/icon192.png` (192x192 for PWA)
   - `/src/assets/logos/icon.png` (for React components)
   - `/src/assets/logos/horizontal-logo.png` (for header)

2. **Resize the logo** to each size while maintaining aspect ratio and visual quality.

3. **Files already updated:**
   - ✅ `public/manifest.json` - Chrome extension manifest
   - ✅ `public/pwa-manifest.json` - PWA manifest (name updated)
   - ✅ `public/index.html` - Meta tags for social sharing

4. **React components to update:**
   - `src/components/YoursIcon.tsx` - Uses `/src/assets/logos/icon.png`
   - `src/components/TopNav.tsx` - Uses `/src/assets/logos/horizontal-logo.png`

The logo has a dark background with an orange/gold Bitcoin symbol and key design, perfect for a Bitcoin wallet extension!