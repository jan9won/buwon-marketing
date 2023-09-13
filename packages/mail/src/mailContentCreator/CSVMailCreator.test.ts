import { CSVMailCreator } from './CSVMailCreator'
import mockfs from 'mock-fs'

const ORIGINAL_CSV_STRING=
'구분,업체명,규모,주요 보관 품목,담당자명,부서명,연락처,이메일,전송,수신,회신,소재지,주요사업,웹사이트,업체 이벤트,전년도 매출액,기타문의채널\n'
+ '화주,블레스빈,중소,생두,대표이메일,,031-705-8150,blessbean@blessbean.com,0,0,0,경기도 성남시 분당구,"카페, 원두제조판매",,,,\n'
+ '화주,벨치즈코리아,대,치즈,대표이메일,,,sjkim@groupe-bel.com,0,0,0,서울특별시 중구 ,유제품 유통,-,,,\n'

beforeAll(()=>{
  mockfs({
    './marketingTargetCSV.csv': ORIGINAL_CSV_STRING
  })
});

afterAll(()=>{
  mockfs.restore();
});


describe('CSVMailCreator', () => {

  let mailCreator: InstanceType<typeof CSVMailCreator>;

  it('Creates instance of CSVMailCreator', () => {
    mailCreator = new CSVMailCreator()
    expect(mailCreator)
      .toBeInstanceOf(CSVMailCreator);
  })

  it('Parses CSV file downloaded from Google Sheets', async () => {
    await mailCreator.parseCSV('./marketingTargetCSV.csv');
    expect(mailCreator.CSVDataTyped.length).toBe(2);
    expect(mailCreator.CSVDataTyped[0].COMPANY_NAME).toBe("블레스빈");
  })

  it('Creates mail options', () => {
    mailCreator.createMailOptions('foo@foo.com','bar@bar.com');
  })

  it('Stringifies mail options to CSV', () => {
    const CSVString = mailCreator.serializeMailOptionsToCSV();
    expect(CSVString).toMatch(/벨치즈코리아/)

  });
})

