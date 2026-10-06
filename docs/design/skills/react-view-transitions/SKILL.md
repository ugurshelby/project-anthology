---
name: react-view-transitions
description: Physics-based, interruptible shared-element and page transition system integrating React 19 View Transitions and Framer Motion for Apex.
---

# React View Transitions & Motion Engine (Apex Layer 4)

Bu yetkinlik; Apex genelindeki sayfa ve bileşen geçişlerinde kesinti hissini ortadan kaldıran, Apple fizik tabanlı, kesintiye uğrayabilir (interruptible) shared-element geçişlerini yönetir.

## Temel Prensipler

1. **Kesintisizlik (Continuity):**
   - Liste elemanından detay sayfasına geçerken (örn. Grid'den Pilot Detay'a veya Yarış Takvimi'nden Round Detay'a) paylaşılan öğelerin (Hero, rozet, numara) akıcı bir şekilde büyümesi ve küçülmesi.
2. **Apple Yay Fiziği (Spring Physics):**
   - Mekanik lineer/ease eğrileri yerine kütle ve sönümlemeye dayalı yay fiziği:
     ```ts
     export const APEX_SPRING = {
       type: 'spring',
       mass: 0.8,
       stiffness: 180,
       damping: 24,
     };
     ```
3. **Kesintiye Uğrayabilirlik (Interruptibility):**
   - Kullanıcı animasyon bitmeden geri tuşuna bastığında veya başka bir sekmeye tıkladığında animasyon sıfırlanmaz; mevcut hız vektörüyle yeni hedefe süzülür.
4. **Erişilebilirlik ve `prefers-reduced-motion`:**
   - Ziyaretçi hareket kısıtlama tercihi açtığında tüm View Transition ve Framer Motion süreleri anında `0.01ms`'ye iner veya doğrudan `opacity` geçişine düşer.

## Next.js & Framer Motion Entegrasyonu

```tsx
'use client';

import { motion } from 'framer-motion';

export function SharedPaddockCard({ layoutId, children }: { layoutId: string; children: React.ReactNode }) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}
```
