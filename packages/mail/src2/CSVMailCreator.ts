import { readFile } from "fs/promises";
import { SimplifiedMailOptions } from "./NodeMailerNaverSMTP";
import { parse, stringify } from "csv/sync";

// -------------------------------------------------------------------------- //
// CSV Contents Types
// -------------------------------------------------------------------------- //

const CSVColumnIndex = {
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
    [key in keyof typeof CSVColumnIndex]: string
}

// Property type modifier (ignores newly added keys)
type Modify<T, O extends Partial<Record<keyof T, any>>> = {
    [K in keyof T]: K extends keyof O ? O[K] : T[K];
}

// Type-modified object
export type CSVColumnTyped = Modify<
  // All string typed interface 
  CSVColumnParsed,
  // Modification of some property types
  {
    ITEMS: string[],
    COUNT_SENT: number,
    COUNT_REPLIED: number,
    COUNT_RECEIVED: number,
  }
>

// -------------------------------------------------------------------------- //
// Main Class
// -------------------------------------------------------------------------- //
export class CSVMailCreator {

  MailOptions: SimplifiedMailOptions[] = []
  CSVDataTyped: CSVColumnTyped[] = []

  constructor () {}

  async parseCSV (CSVFilePath: string) {

    const CSVFile = await readFile(CSVFilePath, "utf8");
    const CSVData: CSVColumnParsed[] = parse(CSVFile, {
      columns: Object.keys(CSVColumnIndex),
      from_line: 2,
    });

    // console.log (Object.keys(CSVColumnIndex));
    this.CSVDataTyped = CSVData.flatMap(row => {
      return row.RECEIVER_EMAIL === '' || parseInt(row.COUNT_SENT) > 0
        ? []
        : [{
          ...row,
          COMPANY_MAIN_BUSINESS: row.COMPANY_MAIN_BUSINESS,
          COMPANY_OTHER_INQUIRY_CHANNEL: row.COMPANY_OTHER_INQUIRY_CHANNEL,
          RECEIVER_EMAIL: row.RECEIVER_EMAIL,
          RECEIVER_NAME: row.RECEIVER_NAME,
          RECEIVER_TEAM: row.RECEIVER_TEAM,
          RECEIVER_PHONE: row.RECEIVER_PHONE,
          COUNT_RECEIVED: parseInt(row.COUNT_RECEIVED),
          COUNT_REPLIED: parseInt(row.COUNT_REPLIED),
          COUNT_SENT: parseInt(row.COUNT_SENT),
          ITEMS: row.ITEMS ? row.ITEMS.split(',') : []
        } as CSVColumnTyped]
    })
  }

  createMailOptions(FROM?: string, TO?: string) {
    this.MailOptions = this.CSVDataTyped.map(row => {
      // subject
      const subject = row.RECEIVER_NAME === "대표이메일" 
        ? `${row.COMPANY_NAME}${(row.COMPANY_NAME.codePointAt(row.COMPANY_NAME.length-1) as unknown as number - 0xAC00) % 28 > 0 ? '을' : '를'} 위한 부산 북항/영도 지역  저온 창고 제휴를 제안합니다.`
        : `${row.RECEIVER_NAME}님, 부산 북항/영도 지역 저온 창고 제휴를 제안합니다.`;

      const body = `안녕하세요 ${row.RECEIVER_NAME === "대표이메일"
          ? row.COMPANY_NAME + " 물류 담당자님"
          : row.RECEIVER_NAME + "님"}, 부원로지스 김현주 과장입니다.\n`
        + "\n"
        + "지금도 좋은 보관업체와 함께 운영중이시겠지만,\n"
        + "저희 회사에서도 견적을 받아보시면 좀 더 경쟁력있는 기회가 되지 않을까 하는 바람으로 연락드립니다.\n"
        + "\n"
        + `저희는 일반, 냉장, 냉동, 농수산물 등 거의 모든 화물을 취급하는 부산 영도 유일의 복합보세창고${row.ITEMS.length === 0 ? "입니다.\n" : "이며,\n" + row.ITEMS.join(',') + " 보관에 대한 경험이 있습니다.\n"}`
        + "또한 리팩킹, 라벨링, 검역, 선용품 보관 등 부가서비스 전반을 제공하고 있으며,\n"
        + "잦은 소량 출고작업도 지체 없이 도와드리고 있습니다.\n"
        + "\n"
        + "아래 홈페이지에서 더 많은 정보 확인하실 수 있으며,\n"
        + "자세한 사항은 아래 연락처로 연락주시면 안내드리겠습니다.\n"
        + "이번 기회로 귀사와 연이 닿아 좋은 파트너가 되었으면 합니다.\n"
        + "\n"
        + "\n"

      const text = body
        + 'Website    buwon-logis.com\n'
        + 'Email      buwoncbw@naver.com\n'
        + 'Phone	    051-417-1151~2\n';

      const html = 
        `<p class="p1" style=" margin: 0px; padding: 0px; font-variant: normal; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-stretch: normal; line-height: 1.8;  font-size: 14px; font-style: normal; font-family: NanumGothic, 나눔고딕, sans-serif; color: rgb(0, 0, 0);">`
        + body.replaceAll('\n','<br/>')
        + `</p>`
        + '<hr style="margin:20px 0 20px 0"><table><tbody><tr style="line-height:1.4"><td colspan="2"><a href="https://buwon-logis.com" rel="noreferrer noopener" target="_blank"><img src="https://buwon-logis.com/public/logo_email.png" width="185" height="32" alt="부원로지스 로고"></a></td></tr><tr style="line-height: 1.4;"><td colspan="2"><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;  font-weight: bold; color: black">수출입 보세화물 보관, 리팩킹, 라벨링</span></td></tr><tr style="line-height: 1.4;"><td colspan="2"><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;  font-weight: bold; color: black">냉장 | 냉동 | 일반 | 선용품</span></td></tr><tr><td colspan="2"> </td></tr><tr style="line-height: 1.4;"><td colspan="2"><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;  font-weight: bold; color: black">유한회사 부원로지스</span></td></tr><tr style="line-height: 1.4;"><td><a href="https://buwon-logis.com" rel="noreferrer noopener" target="_blank" style="text-decoration:none"><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;  font-weight: bold; color: #FF4516">WEB.</span></a></td><td><a href="https://buwon-logis.com" rel="noreferrer noopener" target="_blank" style="text-decoration:none"><span style="font-family: 나눔고딕, NanumGothic, sans-serif;"> </span><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt; font-weight: bold; color: #FF4516">buwon-logis.com</span></a></td><td></td></tr><tr style="line-height: 1.4;"><td><a href="tel: 051-417-1151" rel="noreferrer noopener" target="_blank" style="text-decoration:none"><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;">TEL.</span></a></td><td><span style="font-family: 나눔고딕, NanumGothic, sans-serif;"> </span><a href="tel: 051-417-1151" rel="noreferrer noopener" target="_blank" style="text-decoration:none"><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;">051-417-1151~2, 412-3606~7</span></a></td><td></td></tr><tr style="line-height: 1.4;"><td><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;">FAX.</span></td><td><span style="font-family: 나눔고딕, NanumGothic, sans-serif;"> </span><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;">051-413-8119</span></td><td></td></tr><tr style="line-height: 1.4;"><td><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;">ADDR.    </span></td><td><span style="font-family: 나눔고딕, NanumGothic, sans-serif;"> </span><span style="font-family: 나눔고딕, NanumGothic, sans-serif; font-size: 10pt;">부산 영도구 해양로 109 (청학동 1-38)</span></td><td></td></tr></tbody></table><p><br></p>'

      return {
        from: FROM ? FROM : 'buwoncbw@naver.com',
        to: TO ? TO : row.RECEIVER_EMAIL, 
        subject: subject,
        text: text,
        html: html,
      }
    })
  }
  
  serializeMailOptionsToCSV () {
    return stringify(this.MailOptions,{
      columns: Object.keys(this.MailOptions[0]).map(col => ({ key: col }))
    })
  }
}

