import { NodeMailerNaverSMTP } from './NodeMailerNaverSMTP';

describe('NodeMailerNaverSMTP',function(){
  it('Creates an instance',() => {
    const naverSMTP = new NodeMailerNaverSMTP(
      'jwseo94',
      'jw10010kkk',
    )
    expect(naverSMTP)
      .toBeInstanceOf(NodeMailerNaverSMTP);
  })
});
