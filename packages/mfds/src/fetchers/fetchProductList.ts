import https from 'https';
import * as constants from '../constants';
import { parse as parseHTML } from 'node-html-parser'

// ------------------------------------------------------------------------ //
// Typings
// ------------------------------------------------------------------------ //
type QueryParameterType = {
  totalCnt?: number  // 
  page: number  // 페이지넘버
  limit: number  // 페이지당 표시갯수
  dclPrductSeCd: typeof constants.foodTypeCode.listProduct[keyof typeof constants.foodTypeCode.listProduct], // 구분
  prductNm?: string  // 제품명
  rpsntItmNm: string[] // 품목명 (comma separated)
  bsshNm?: string  // 이력추적번호
  srchNtncd?: string  // 국가
  ovsmnfstNm?: string  // 제조/작업/수출업소
  returnChk?: boolean  // 회수판매중지
  sameSearch?: boolean  // 일치검색
  srchStrtDt: Date  // 처리일자 (시작)
  srchEndDt: Date  // 처리일자 (끝)
  expirdeBeginDtm?: Date  // 소비기한 (시작)
  expirdeEndDtm?: Date  // 소비기한 (끝)
  srchHistNo?: string  // 
  rpsntItmCd: string[]  // 품목 넘버 (comma separated)
  oemFoodYn?: boolean // 주문자상표부장방식
}
type QueryParameterStringifiedType = Record <keyof QueryParameterType, string>

// ------------------------------------------------------------------------ //
// Date Object Serializer
// ------------------------------------------------------------------------ //
const stringifyDateForQuery = (DateObject: Date) =>
  DateObject.getFullYear().toString()
  + "-" + 
  (
    (DateObject.getMonth()+1).toString().length < 2
    ? "0" + (DateObject.getMonth()+1).toString()
    : (DateObject.getMonth()+1).toString()
  )
  + "-" +
  (
    DateObject.getDate().toString().length < 2
    ? "0" + DateObject.getDate().toString()
    : DateObject.getDate().toString()
  )


// ------------------------------------------------------------------------ //
// Single Page Request
// ------------------------------------------------------------------------ //
async function listProductPage (queryParameters: QueryParameterType) {

  if (queryParameters.rpsntItmNm.length === 0) throw new Error('Query parameter "rpsntItmNm" requires at least one element.');

  // Stringify parameters
  const QueryParameterStringified: QueryParameterStringifiedType = {
    totalCnt: queryParameters.totalCnt ? queryParameters.totalCnt.toString() : "",  // 
    page: queryParameters.page ? queryParameters.page.toString() : "1",  // 페이지넘버
    limit: queryParameters.limit ? queryParameters.limit.toString() : "10",  // 페이지당 표시갯수
    dclPrductSeCd: queryParameters.dclPrductSeCd ?? "1",  // 구분
    prductNm: queryParameters.prductNm ?? "",  // 제품명
    rpsntItmNm: queryParameters.rpsntItmNm.join(','),  // 품목명
    bsshNm: queryParameters.bsshNm ?? "",  // 이력추적번호
    srchNtncd: queryParameters.srchNtncd ?? "",  // 국가
    ovsmnfstNm: queryParameters.ovsmnfstNm ?? "",  // 제조/작업/수출업소
    returnChk: queryParameters.returnChk === undefined ? "" : queryParameters.returnChk ? "y" : "n",  // 회수판매중지
    sameSearch: queryParameters.sameSearch === undefined ? "" : queryParameters.sameSearch ? "y" : "n",  // 일치검색
    srchStrtDt: stringifyDateForQuery(queryParameters.srchStrtDt),  // 처리일자 (시작)
    srchEndDt: stringifyDateForQuery(queryParameters.srchEndDt),  // 처리일자 (끝)
    expirdeBeginDtm: queryParameters.expirdeBeginDtm ? stringifyDateForQuery(queryParameters.expirdeBeginDtm) : "",  // 소비기한 (시작)
    expirdeEndDtm: queryParameters.expirdeEndDtm ? stringifyDateForQuery(queryParameters.expirdeEndDtm) : "",  // 소비기한 (끝)
    srchHistNo: queryParameters.srchHistNo ?? "",  // 
    rpsntItmCd: queryParameters.rpsntItmCd.join(','),  // 품목 넘버 (comma separated)
    oemFoodYn: queryParameters.oemFoodYn === undefined ? "" : queryParameters.oemFoodYn ? "y" : "n", // 주문자상표부장방식
  }

  // URL
  const requestURL = new URL (
    `${constants.uri.protocol}://${constants.uri.host}${constants.uri.listProduct}`);

  Object.entries(QueryParameterStringified).forEach(param => {
    requestURL.searchParams.set(param[0], param[1]);
  });
  // console.log(requestURL.toString())

  // Request, parse
  return new Promise<string>((resolve,reject)=>{
      https.get(requestURL, {}, (incomingMessage) => {
      let aggregatedData = '';
      incomingMessage.setEncoding('utf8');
      incomingMessage.on('data', (data) => {aggregatedData += data});
      incomingMessage.on('end', () => resolve(aggregatedData));
    })
    .on('error', (err) => { throw err });
  })
}

// ------------------------------------------------------------------------ //
// Main Function
// ------------------------------------------------------------------------ //
export default async (
  dclPrductSeCd: keyof typeof constants.foodTypeCode.listProduct,
  rpsntItmNm: string[],  // 품목명
  rpsntItmCd: string[],  // 품목 넘버 (comma separated)
  srchStrtDt: Date,
  srchEndDt: Date,
): Promise<{
  [K in typeof constants.productListColumn[number]]: string
}[]> => {

  // ------------------------------------------------------------------------ //
  // get total count
  // ------------------------------------------------------------------------ //
  let totalCount:number|undefined;
  await listProductPage({
    page: 1,
    limit: 10,
    dclPrductSeCd: constants.foodTypeCode.listProduct[dclPrductSeCd],
    rpsntItmNm: rpsntItmNm,
    srchStrtDt: srchStrtDt,
    srchEndDt: srchEndDt,
    rpsntItmCd: rpsntItmCd,
  })
  .catch(err => {throw err})
  .then(data => {
      const parsedDOM = parseHTML(data);
      const totalCountString = parsedDOM
        .querySelector('#content > div.board_count > span > strong')
        ?.innerText
        .replace(/,/g,'')
      ;
      totalCount = totalCountString ? parseInt(totalCountString) : undefined
  })

  // ------------------------------------------------------------------------ //
  // get product list
  // ------------------------------------------------------------------------ //
  if (totalCount === undefined) throw new Error('Total count is not found');
  if (totalCount > 100000) {
    console.log(`Total count was ${totalCount} and cut to 100000`)
    totalCount = 100000;
  }
  // console.log(totalCount);

  return await listProductPage({
    page: 1,
    limit: totalCount,
    dclPrductSeCd: constants.foodTypeCode.listProduct[dclPrductSeCd],
    rpsntItmNm: rpsntItmNm,
    srchStrtDt: srchStrtDt,
    srchEndDt: srchEndDt,
    rpsntItmCd: rpsntItmCd,
  })
  .catch(err => {throw err})
  .then(data => {
      const parsedDOM = parseHTML(data);
      const allProductsRaw = parsedDOM.querySelectorAll('#content > table > tbody > tr');
      const allProducts = allProductsRaw.map(product => {
        const tdArray = product.querySelectorAll('td')
          .map(col => col.innerText.replace(/[\r\n\t]/g,''));
        return tdArray.reduce((acc,td,idx) => {
          acc[constants.productListColumn[idx]] = td;
          return acc;
        }, {} as {[K in typeof constants.productListColumn[number]]: string})
      });
      return allProducts;
  })

  // ------------------------------------------------------------------------ //
  // Write to CSV File
  // ------------------------------------------------------------------------ //
  // const CSVString = stringifyCSV (result, {
  //   columns: constants.productListColumn.slice(1)
  // })
  // await writeFile(
  //   await createFileNameIncrementally(join(__dirname,'../result/listProduct.csv')),
  //   CSVString,
  // );
}
