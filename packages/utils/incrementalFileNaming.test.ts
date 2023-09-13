import { incrementalFileNaming } from "./incrementalFileNaming";
import mockfs from 'mock-fs';

describe('Incremental File Naming',()=>{

  afterEach(() => {
    mockfs.restore();
  })

  it('Creates file name incrementally when there\'s duplicate',async ()=>{
    mockfs({
      './parent-dir': {
        'foo.csv': '',
        'bar.csv': '',
        'bar(2).csv': '',
      },
    })
    expect(await incrementalFileNaming.create('./parent-dir/foo.csv'))
      .toBe('./parent-dir/foo(1).csv')
    expect(await incrementalFileNaming.create('./parent-dir/bar.csv'))
      .toBe('./parent-dir/bar(1).csv')
  });

  it('Finds the last increment file of the duplicates with given path',async () => {
    mockfs({
      './parent-dir': {
        'foo.csv': '',
        'foo(1).csv': '',
        'foo(2).csv': '',
        'bar.csv': '',
      },
    })
    expect(await incrementalFileNaming.find('./parent-dir/foo.csv'))
      .toBe('./parent-dir/foo(2).csv')
    expect(await incrementalFileNaming.find('./parent-dir/bar.csv'))
      .toBe('./parent-dir/bar.csv')
  });
})
