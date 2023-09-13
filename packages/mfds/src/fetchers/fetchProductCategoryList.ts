import * as constants from '../constants';
import https from 'https';
import { parse as parseHTML } from 'node-html-parser';
// import { stringify as stringifyCSV } from 'csv/sync';
// import { writeFile } from 'fs/promises';
// import { PathLike } from 'fs';

// -------------------------------------------------------------------------- //
// Query Parameter Type
// -------------------------------------------------------------------------- //
type foodTypeCodeType  = typeof constants.foodTypeCode.listProductCategory
type QueryParameterType = {
  page: number,  // 페이지넘버
  limit: number,  // 페이지당 표시갯수
  callBackFn?:	'fnPopupCallback',  // (고정)
  usePageId?: 'CFCCC01F01',  // (고정)
  force?: string,
  frmMultiItmCd?: string,
  frmMultiItmNm?: string, 
  multiple?: string,  
  initValues?: string,  
  dclPrductYn?: boolean,  // 회수판매중지
  tySpcisLclsCd: foodTypeCodeType[keyof foodTypeCodeType], // 구분
  itmCd?: string,  
  useYnNm?: string,  
  koreanNm: string,  // 한글 검색어
}
type QueryParameterStringifiedType = Record <keyof QueryParameterType, string>

// -------------------------------------------------------------------------- //
// Request
// -------------------------------------------------------------------------- //
async function listProductCategoryPage (queryParameters: QueryParameterType) {

  // Stringify given parameters
  const QueryParameterStringified: QueryParameterStringifiedType = {
    page: queryParameters.page ? queryParameters.page.toString() : "1",  // 페이지넘버
    limit: queryParameters.limit ? queryParameters.limit.toString() : "10",  // 페이지당 표시갯수
    callBackFn: 'fnPopupCallback',  // (고정)
    usePageId: 'CFCCC01F01',  // (고정)
    force: queryParameters.force ?? "",
    frmMultiItmCd: queryParameters.frmMultiItmCd ?? "",
    frmMultiItmNm: queryParameters.frmMultiItmNm ?? "",
    multiple: queryParameters.multiple ?? "",
    initValues: queryParameters.initValues ?? "",
    dclPrductYn: queryParameters.dclPrductYn === undefined ? "" : queryParameters.dclPrductYn ? "y" : "n",  // 회수판매중지
    tySpcisLclsCd: queryParameters.tySpcisLclsCd ?? "", // 구분
    itmCd: queryParameters.itmCd ?? "",
    useYnNm: queryParameters.useYnNm ?? "",
    koreanNm: queryParameters.koreanNm ?? "", // 한글 검색어
  }

  // URL
  const requestURL = new URL (
    `${constants.uri.protocol}://${constants.uri.host}${constants.uri.listProductCategory}`);

  Object.entries(QueryParameterStringified).forEach(param => {
    requestURL.searchParams.set(param[0], param[1]);
  });
  // console.log(requestURL.toString())

  // Request, parse
  return new Promise<string>((resolve)=>{
    https.get(requestURL, {}, (incomingMessage) => {
      let aggregatedData = '';
      incomingMessage.setEncoding('utf8');
      incomingMessage.on('data', (data) => {aggregatedData += data});
      incomingMessage.on('end', () => resolve(aggregatedData));
      // incomingMessage.on('error', (err) => reject(err));
    })
    .on('error', (err) => { throw err });
  })
}

// -------------------------------------------------------------------------- //
// Main Function
// -------------------------------------------------------------------------- //
export default async (
  searchKeyword: string,
  displayKeyword: string,
  tySpcisLclsCd: keyof typeof constants.foodTypeCode.listProductCategory,
): 
Promise<{
  'foodType': keyof foodTypeCodeType,
  'productCategoryDisplayName': string,
  'productCategoryName': string,
  'productCategoryCode': string,
}[]> => {

  // ------------------------------------------------------------------------ //
  // Get Total Count from the First Page
  // ------------------------------------------------------------------------ //
  let totalCount:number|undefined;
  await listProductCategoryPage({
    page: 1,
    limit: 10,
    koreanNm: searchKeyword,
    tySpcisLclsCd: constants.foodTypeCode.listProductCategory[tySpcisLclsCd]
  })
  .catch(err => {throw err})
  .then(data => {
      const parsedDOM = parseHTML(data);
      const totalCountString = parsedDOM.querySelector('#content_pop > div > div.board_count > span > strong')?.innerText
      totalCount = totalCountString ? parseInt(totalCountString) : undefined
  })
  // console.log(totalCount);

  // ------------------------------------------------------------------------ //
  // Get All Category with Total Count
  // ------------------------------------------------------------------------ //
  if (totalCount === undefined) throw new Error('Total count is not found in the first page');
  return await listProductCategoryPage({
    page: 1,
    limit: totalCount,
    koreanNm: searchKeyword,
    tySpcisLclsCd: constants.foodTypeCode.listProductCategory[tySpcisLclsCd]
  })
  .catch(err => {throw err})
  .then(data => {
      const parsedDOM = parseHTML(data);
      const allProductCategories = parsedDOM.querySelectorAll('#content_pop > div > table > tbody > tr');
      const result = allProductCategories.map(product => {
        const row = product
          .querySelectorAll('td')
          .map(col => col.innerText.replace(/[\r\n\t]/g,''))
        ;
        // Result object
        return {
          'foodType': row[2] as keyof foodTypeCodeType,
          'productCategoryDisplayName': displayKeyword,
          'productCategoryName': row[4],
          'productCategoryCode': row[3],
        }
    });
    return result
  })

}

