/** Turkish text for TYRE_COMPOUNDS (same ids). */

export interface TyreCompoundTr {
  name: string;
  kicker: string;
  blurb: string;
  description: string;
}

export const TYRE_COMPOUNDS_TR: Record<string, TyreCompoundTr> = {
  c1: {
    name: 'C1 — En Sert',
    kicker: 'Kuru · Slick',
    blurb: 'En yüksek enerjili pistler. Geç ısınır, uzun stintler için üretildi.',
    description: 'Serinin en sert slick lastiği. En geç ısınan ama en dayanıklı olan bu lastik, yumuşak kauçuğun aşırı ısınıp tanelendiği yüksek enerjili pistler (sert frenleme, aşındırıcı zemin) için seçilir.',
  },
  c2: {
    name: 'C2 — Sert',
    kicker: 'Kuru · Slick',
    blurb: 'Yarışın iş atı. Tepe tutuştan biraz vazgeçip uzun tur temposunu seçer.',
    description: 'Sağlam bir iş atı sert bileşik. Uzun bir seride istikrar için tepe tutuştan biraz feragat eden güçlü bir tek duruşluk lastik; zorlayıcı pistlerde sık sık yarış lastiği olur.',
  },
  c3: {
    name: 'C3 — Orta',
    kicker: 'Kuru · Slick',
    blurb: 'Serinin ortası. Seçime göre sert ya da yumuşak rolü oynayabilir.',
    description: 'Serinin dengeli ortası ve en çok yönlü bileşik. Pirelli\'nin o hafta sonu için seçtiği üç bileşene bağlı olarak sert ya da yumuşak gibi davranabilir.',
  },
  c4: {
    name: 'C4 — Yumuşak',
    kicker: 'Kuru · Slick',
    blurb: 'Virajlı, düşük enerjili pistler. Hızlı ısınır, ömrü kısa.',
    description: 'Virajlı ve düşük enerjili pistler için yüksek tutuşlu yumuşak lastik. Hızla devreye girer ve tek turda güçlüdür, ama bunun bedeli ömründen ödenir; çoğunlukla sıralama ya da kısa stint lastiğidir.',
  },
  c5: {
    name: 'C5 — En Yumuşak',
    kicker: 'Kuru · Slick',
    blurb: 'Sokak pisti sıralama silahı. En yüksek tutuş, en hızlı düşüş.',
    description: 'En yumuşak ve en tutuşlu slick. Sokak pistleri ve sıralama için muazzam tek tur temposu sunar ama en hızlı yıpranır; onunla yarışacak sürücülerin dikkatle yönetmesi gerekir.',
  },
  intermediate: {
    name: 'Ara Hava Lastiği',
    kicker: 'Islak · Desenli',
    blurb: 'Nemli ya da kurumakta olan pist. Tam yağmur lastiğinin sürüklenmesi olmadan hafif suyu atar.',
    description: 'Nemli ya da kurumakta olan pist için geçiş lastiği. Deseni, tam yağmur lastiğine göre daha az su kütlesini atar ve slick koşullarla şiddetli yağmur arasındaki dar aralıkta en hızlı lastiktir.',
  },
  wet: {
    name: 'Tam Yağmur Lastiği',
    kicker: 'Islak · Desenli',
    blurb: 'Şiddetli yağmur. Hidroplanlamaya karşı derin desen; kuru çizgi çıkınca yavaş.',
    description: 'En fazla suyu atabilen ve en ağır koşullarda hidroplanlamaya direnen derin desenli yağmur lastiği. Daha serin çalışır ve pist gerçekten su altındayken en yüksek tutuşu verir, ama kuru çizgi belirdiği anda yavaşlar.',
  },
};
