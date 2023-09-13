export const ColumnNames = {
  COMPANY_TYPE: 0,
  COMPANY_NAME: 1,
  COMPANY_SIZE: 2,
  ITEMS: 3,
  RECEIVER_NAME: 4,
  RECEIVER_TEAM: 5,
  RECEIVER_PHONE: 6,
  RECEIVER_EMAIL: 7,
  COUNT_SENT: 8,
  COUNT_RECEIVED: 9,
  COUNT_REPLIED: 10,
  COMPANY_ADDRESS: 11,
  COMPANY_MAIN_BUSINESS: 12,
  COMPANY_WEBSITE: 13,
  COMPANY_EVENT: 14,
  COMPANY_REVENUE: 15,
  COMPANY_OTHER_INQUIRY_CHANNEL: 16,
}

// 'csv' module parser output object
type CSVColumnParsed = {
  [key in keyof typeof ColumnNames]: string
}

/** # Property type modifier
 * ## Parameters 
 * 1. T (Existing Object)
 *    An object whose properties will be overwritten.
 * 2. O (Overwriting Object)
 *    A partial object of T, which values will overwrite T's properties.
 * ## Type
 * 1. `[K in keyof T]`
 *    Only uses keys from the T not O
 * 2. `K extends keyof O ? O[k] : T[K]`
 *    Use O's property value if exists, and use T's when it doesn't
 */
type Modify<T, O extends Partial<Record<keyof T, any>>> = {
  [K in keyof T]: K extends keyof O ? O[K] : T[K];
}

// Type-modified object
export type CSVColumnTyped = Modify<
  // Given properties
  CSVColumnParsed,
  // Modify some property types
  {
    ITEMS: string[],
    COUNT_SENT: number,
    COUNT_REPLIED: number,
    COUNT_RECEIVED: number,
  }
>
