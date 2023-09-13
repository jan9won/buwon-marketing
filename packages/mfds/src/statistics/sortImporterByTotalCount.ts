import { createFileNameIncrementally } from '../../utils/createFileNameIncrementally'
import { readdir, writeFile, readFile } from 'fs/promises';
import { basename } from 'path';
import { stringify } from 'csv/sync'
import constants from './constants';
import { join, extname } from 'path';

async function main () {

  // Get all xlsx file paths
  const leaf_parent_directory = '../data/';
  const leaf_directories = await readdir (leaf_parent_directory);
  const data_file_paths:string[] = [];

  for (let i = 0; i < leaf_directories.length; i++) {
    data_file_paths.push( ...(await readdir(leaf_directories[i]))
      .flatMap(file => {
        if (/\.[xlsx|csv]$/.test(file)){
          return [`${leaf_directories[i]}/${file}`]
        } else {
          return []
        }
      })
    );
  }

  // Column Names 
  const column_names = constants.productListColumn.reduce((acc,val,idx) => {
    acc[val] = idx; return acc
  }, {} as Record<string,number>)


  // ------------------------------------------------------------------------ //
  // Result objects: importer count
  // ------------------------------------------------------------------------ //
  const importer_count_kv : Record<string,
    {
      total_count: number,
      product_category_summary_count: Record<string, number>,
      product_category_actual_count: Record<string, number>,
    }
  > = {}

  const importer_count : {
    importer: string,
    total_count: number,
    product_category_summary_sorted: string,
    product_category_actual_sorted: string,
  }[] = [] 

  // ------------------------------------------------------------------------ //
  // Result objects: category-importer count
  // ------------------------------------------------------------------------ //
  const category_importer_count_kv : Record<string,
    {
      food_type: string,
      category_count: number,
      importer: Record<string, number>
    }
  > = {}

  const category_importer_count : [
    product_category: string,
    category_count: number,
    food_type: string,
    importer: string,
    importer_count: number,
  ][] = []
    
  // ------------------------------------------------------------------------ //
  // Collect data from each file
  // ------------------------------------------------------------------------ //
  for (let file_number = 0; file_number < data_file_paths.length; file_number++) {

    const data_file_path = data_file_paths[file_number];
    console.log(`Processing ${data_file_paths[file_number]}...`);

    let data: string[][] = [];
    switch (extname(data_file_path)) {
      case '.json':
        const JSONFile = await readFile(data_file_path, {
          encoding: 'utf8'
        });
        const JSONFileParsed = JSON.parse(JSONFile);
        
        break;
        
      case '.csv':
        break;

      case '.xlsx':
        
        
        

        break;

      default:
        break;
    }



    // Per row
    for (let row = 1; row < sheet.length; row++) {

      // Desired data on each row
      const importer = sheet[row][column_names.importer][cell.raw_value];
      const food_type = sheet[row][column_names.food_type][cell.raw_value]
      const product_category_actual = sheet[row][column_names.product_category][cell.raw_value]
      const product_category_summary = basename(data_file_paths[file_number]).split('.xlsx')[0].split('(')[0].replace(',','/');
      
      // -------------------------------------------------------------------- //
      // category_importer count
      // -------------------------------------------------------------------- //
      category_importer_count_kv[product_category_summary] ??= {
        food_type: food_type,
        category_count: 0,
        importer : {},
      };

      // category count
      category_importer_count_kv[product_category_summary].category_count ++;

      // importer count
      category_importer_count_kv[product_category_summary].importer[importer] ??= 0;
      category_importer_count_kv[product_category_summary].importer[importer] ++;

      // -------------------------------------------------------------------- //
      // importer count
      // -------------------------------------------------------------------- //
      importer_count_kv[importer] ??= {
        total_count: 0,
        product_category_summary_count: {},
        product_category_actual_count: {},
      }

      // importer count
      importer_count_kv[importer].total_count ++;
      
      // product category (actual) count
      importer_count_kv[importer].product_category_actual_count[product_category_actual] ??= 0;
      importer_count_kv[importer].product_category_actual_count[product_category_actual] ++;

      // product category (summary) count
      importer_count_kv[importer].product_category_summary_count[product_category_summary] ??= 0;
      importer_count_kv[importer].product_category_summary_count[product_category_summary] ++;
    }
  }
  // ------------------------------------------------------------------------ //
  // Sort category_importer count
  // ------------------------------------------------------------------------ //

  Object.entries(category_importer_count_kv).forEach(category => {
    Object.entries(category[1].importer).forEach(importer => {
      category_importer_count.push([
        category[0],
        category[1].category_count,
        category[1].food_type,
        importer[0],
        importer[1],
      ])
    })
  })

  category_importer_count.sort((a,b) => {
    // category count 
    if (a[1] < b[1]) {
      return 1
    }
    if (a[1] > b[1]) {
      return -1
    }
    // importer count 
    if (a[0] === b[0]) {
      if (a[4] < b[4]) {
        return 1
      }
      if (a[4] > b[4]) {
        return -1
      }
    }
    return 0
  })

  // ------------------------------------------------------------------------ //
  // Sort importer count (and its property arrays)
  // ------------------------------------------------------------------------ //
  const importer_count_sorted = Object.entries(importer_count_kv).sort((a,b) => {
    if (a[1].total_count < b[1].total_count) return 1
    if (a[1].total_count > b[1].total_count) return -1
    return 0
  });

  importer_count.push(...importer_count_sorted.map(el => ({
    importer: el[0],
    total_count: el[1].total_count,
    product_category_summary_sorted: (Object.entries(el[1].product_category_summary_count).sort((a,b)=>{
      if (a[1] < b[1]) return 1
      if (a[1] > b[1]) return -1
      return 0
    })).map(tuple => tuple[0]).join(','),
    product_category_actual_sorted: (Object.entries(el[1].product_category_actual_count).sort((a,b)=>{
      if (a[1] < b[1]) return 1
      if (a[1] > b[1]) return -1
      return 0
    })).map(tuple => tuple[0]).join(',')
  })))

  // ------------------------------------------------------------------------ //
  // Write to file
  // ------------------------------------------------------------------------ //

  console.log(
    // category_importer_count
  )

  // write category_importer_count
  writeFile(
    await createFileNameIncrementally('./result/category_importer_count.csv'),
    stringify(category_importer_count,{
      header: true,
      columns: [
        "product_category",
        "category_count",
        "food_type",
        "importer",
        "importer_count",
      ]
    })
  )

  // write importer count
  writeFile(
    await createFileNameIncrementally('./result/importer_count.csv'),
    stringify(importer_count,{
      header: true,
      columns: [
        'importer',
        'total_count',
        'product_category_summary_sorted',
        'product_category_actual_sorted',
      ]
    })
  )
    
}

main();

