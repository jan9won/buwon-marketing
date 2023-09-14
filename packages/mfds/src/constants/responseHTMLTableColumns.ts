export const fetchProductCategoryList = [
  'selectBox',
  'pageIndex',
  'foodType',
  'productCategoryCode',
  'productCategoryName',
  'isBeingUsed'
] as const

export const fetchProductList = [
  "foodType",
  "importer",
  "productNameKor",
  "productNameEng",
  "productCategory",
  "productFactory",
  "confirmDate",
  "bestBefore",
  "producedCountry",
  "exportedCountry",
] as const

export const responseHTMLTableColumns = {
  fetchProductCategoryList,
  fetchProductList,
}
