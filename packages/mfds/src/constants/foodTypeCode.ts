const listProductCategory = {
  "식물성": "A",
  "동물성": "B",
  "가공식품": "C",
  "식품첨가물": "D",
  "건강기능식품": "E",
  "기구및용기포장": "F",
  "위생용품": "H",
  "기타": "X",
  "동물성(기타)": "Z",
} as const

const listProduct = {
  "농임산물": "1",
  "수산물": "2",
  "축산물": "3",
  "가공식품": "4",
  "식품첨가물": "5",
  "기구또는용기포장": "6",
  "건강기능식품": "7",
  "": ""
} as const

const categoryToProductMap = {
  "식물성": "농임산물",
  "동물성": "축산물",
  "동물성(기타)": "축산물",
  "가공식품": "가공식품",
  "식품첨가물": "식품첨가물",
  "건강기능식품": "건강기능식품",
  "기구및용기포장": "기구또는용기포장",
  "위생용품": "기구또는용기포장",
  "기타": "",
} as const

export const foodTypeCode = {
  listProductCategory,
  listProduct,
  categoryToProductMap,
}

