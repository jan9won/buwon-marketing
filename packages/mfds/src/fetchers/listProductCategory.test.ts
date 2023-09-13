import { listProductCategory } from "./listProductCategory";
import productCategoryListTestData from '../tests/productCategoryListTestData';

import { join } from "path";
import https from 'https';
import { IncomingMessage } from 'http';
import { readFile } from 'fs/promises';

jest.mock('https')

describe('listProductCategory', () => {
  it('Fetches product categories correctly', async () => {
    const mockData = await readFile(
      join(__dirname,'../tests/listProductCategoryTestResponse.html'),
      {
        encoding: 'utf8'
      }
    );
    const mockIncomingMessage = {
      ...IncomingMessage,
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(mockData);
        }
        if (event === 'end') {
          callback();
        }
      }),
      setEncoding: jest.fn()
    };

    // (get as jest.Mock).mockImplementation((url, options, callback) => {
    (https.get as jest.Mock).mockImplementation((url, options, callback) => {
      callback(mockIncomingMessage);
    })

    const productCategoryList = await listProductCategory(
      "커피원두",
      "커피원두",
      "식물성",
    );

    expect(productCategoryList)
      .toStrictEqual(productCategoryListTestData)
  })
});

