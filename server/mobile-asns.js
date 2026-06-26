/**
 * ASN мобильных операторов России и СНГ.
 * Проверка доступа — только если IP принадлежит одному из этих ASN.
 */
export const MOBILE_ASN_ALLOWLIST = new Map([
  // MTS
  [8359, 'MTS PJSC'],
  [6731, 'MTS PJSC'],
  [8580, 'MTS PJSC'],
  [13155, 'MTS PJSC'],
  [13174, 'MTS PJSC'],
  [15640, 'MTS PJSC'],
  [16012, 'MTS PJSC'],
  [16256, 'MTS PJSC'],
  [25086, 'MTS PJSC'],
  [28812, 'MTS PJSC'],
  [29190, 'MTS PJSC'],
  [29194, 'MTS PJSC'],
  [29497, 'MTS PJSC'],
  [30922, 'MTS PJSC'],
  [31286, 'MTS PJSC'],
  [35728, 'MTS PJSC'],
  [39001, 'MTS PJSC'],
  [39858, 'MTS PJSC'],
  [41822, 'MTS PJSC'],
  [42087, 'MTS PJSC'],
  [43148, 'MTS PJSC'],
  [44677, 'MTS PJSC'],
  [48212, 'MTS PJSC'],
  [48400, 'MTS PJSC'],
  [49154, 'MTS PJSC'],
  [51116, 'MTS PJSC'],
  [60490, 'MTS PJSC'],
  [60496, 'MTS PJSC'],
  [13055, 'MTS PJSC'],
  [197023, 'MTS PJSC'],

  // MegaFon
  [6850, 'PJSC MegaFon'],
  [6854, 'PJSC MegaFon'],
  [8263, 'PJSC MegaFon'],
  [12396, 'PJSC MegaFon'],
  [12714, 'PJSC MegaFon'],
  [13075, 'PJSC MegaFon'],
  [20632, 'PJSC MegaFon'],
  [25159, 'PJSC MegaFon'],
  [29648, 'PJSC MegaFon'],
  [31133, 'PJSC MegaFon'],
  [31163, 'PJSC MegaFon'],
  [31195, 'PJSC MegaFon'],
  [31205, 'PJSC MegaFon'],
  [31208, 'PJSC MegaFon'],
  [31213, 'PJSC MegaFon'],
  [31224, 'PJSC MegaFon'],
  [31261, 'PJSC MegaFon'],
  [34552, 'PJSC MegaFon'],
  [41976, 'PJSC MegaFon'],
  [47218, 'PJSC MegaFon'],
  [47395, 'PJSC MegaFon'],
  [50928, 'PJSC MegaFon'],

  // Beeline / VimpelCom
  [3216, 'PJSC Vimpelcom (Beeline)'],
  [8402, 'PJSC Vimpelcom (Beeline)'],
  [16345, 'PJSC Vimpelcom (Beeline)'],

  // Tele2 / T2 Mobile
  [12958, 'T2 Mobile (Tele2)'],
  [15378, 'T2 Mobile (Tele2)'],
  [41330, 'T2 Mobile (Tele2)'],
  [42437, 'T2 Mobile (Tele2)'],
  [48092, 'T2 Mobile (Tele2)'],
  [48190, 'T2 Mobile (Tele2)'],
  [50436, 'T2 Mobile (Tele2)'],

  // Yota
  [41798, 'Yota'],
  [44507, 'Yota'],
  [200698, 'Yota LLC'],

  // MVNO и мобильные бренды
  [35807, 'SkyNet / Tinkoff Mobile'],
  [52104, 'Tinkoff Mobile'],
  [60690, 'MVNO'],
  [3181, 'Matrix Mobile'],
  [28840, 'LETAI Mobile'],

  // Ростелеком — мобильный сегмент (MVNO/LTE)
  [42610, 'Rostelecom Mobile'],
  [12389, 'Rostelecom Mobile'],

  // Казахстан, Беларусь, Узбекистан — для роуминга
  [29355, 'Kcell (KZ)'],
  [35104, 'Beeline KZ'],
  [9198, 'Kazakhtelecom Mobile'],
  [25106, 'Beeline BY'],
  [6697, 'Beeline BY'],
  [31225, 'life:) BY'],
  [43797, 'UzMobile'],
  [28997, 'Beeline UZ'],
]);

/** Ключевые слова в названии ISP для дополнительной эвристики */
export const MOBILE_ISP_KEYWORDS = [
  'mts', 'мтс', 'megafon', 'мегафон', 'mega fon',
  'beeline', 'билайн', 'vimpelcom', 'вимпелком',
  'tele2', 'теле2', 't2 mobile',
  'yota', 'йота',
  'tinkoff mobile', 'тинькофф мобайл',
  'motiv', 'мотив', 'letai', 'лета́й',
  'rostelecom mobile', 'скайнет', 'skynet',
  'kcell', 'life:)', 'uzmobile',
];

export function isMobileAsn(asn) {
  return MOBILE_ASN_ALLOWLIST.has(Number(asn));
}

export function getMobileAsnName(asn) {
  return MOBILE_ASN_ALLOWLIST.get(Number(asn)) || null;
}

export function matchesMobileIsp(isp, org) {
  const text = `${isp || ''} ${org || ''}`.toLowerCase();
  return MOBILE_ISP_KEYWORDS.some((kw) => text.includes(kw));
}
