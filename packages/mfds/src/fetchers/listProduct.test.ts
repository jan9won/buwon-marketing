import { listProduct } from "./listProduct";

import { join } from "path";
import https from 'https';
import { IncomingMessage } from 'http';
import { readFile } from 'fs/promises';
import productListTestData from '../tests/productListTestData';

jest.mock('https')

describe('listProduct', () => {
  
  it('Fetches products correctly', async () => {
    const mockData = await readFile(
      join(__dirname,'../tests/listProductTestResponse.html'),
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

    const productList = await listProduct(
      "가공식품",
      ["과실주"],
      ["C0314180000000000000"],
      new Date('2023-09-01'),
      new Date('2023-09-01'), 
    );

    // console.log(productList);

    expect(productList)
      .toStrictEqual(productListTestData)
  })
});
