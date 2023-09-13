const VERBOSE = true;
import puppeteer from 'puppeteer';
import fsPromises from 'fs/promises';
import { incrementalFileNaming } from 'utils';

const result:{
    url: string | null;
    name: string | null | undefined;
    address: string | null | undefined;
    phone: string | null | undefined;
    website: string | null | undefined;
}[] = [];
let result_string = "name,address,phone,website\n";

async function main() {

  //==========================================================================//
  //  Start Puppeteer
  //==========================================================================//
  const browser = await puppeteer.launch({
    'headless': 'new'
  });
  const page = await browser.newPage();

  //==========================================================================//
  //  Load Page, Retry Until Success
  //==========================================================================//
  while (true) {
    try {
      // Attempt to go to the page with a 10 second timeout
      await page.goto('https://www.tradlinx.com/forwarding', { timeout: 10000 });
      break; // If the page loads within 10 seconds, break out of the loop
    } catch (error) {
      // If the page doesn't load within 10 seconds, reload it
      VERBOSE && console.log('Page load timed out, reloading...');
      continue;
    }
  }
  VERBOSE && console.log('Page loaded successfully');

  //==========================================================================//
  //  Click Filter Buttons
  //==========================================================================//
  //  Service Category
  const xpath_service = '/html/body/application/div/forwarding/div/div/forwarding-filter/div/ul/li[4]'
  const element_list_service = await page.$x(xpath_service)
  await (await element_list_service[0].toElement('button')).click()
  //  Freight Category
  const xpath_cold = '/html/body/application/div/forwarding/div/div/forwarding-filter/div/div[4]/div/div/div[1]/ul/li[5]' 
  const element_list_cold = await page.$x(xpath_cold)
  await (await element_list_cold[0].toElement('button')).click()
  //  Search Button
  const xpath_search = '/html/body/application/div/forwarding/div/div/forwarding-filter/div/div[5]/div[2]/button' 
  const element_list_search = await page.$x(xpath_search)
  await (await element_list_search[0].toElement('button')).click()

  //==========================================================================//
  //  Wait Until Card Container's Children Mutated
  //==========================================================================//
  await page.evaluate(() => {
    return new Promise<void>(resolve => {
      const cardContainerQuerySelector = "#forwarding-default-list";
      let cardContainer = document.querySelector(cardContainerQuerySelector);
      let observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
          if (mutation.type === 'childList') {
            resolve();
          }
        }
      })
      if (cardContainer !== undefined)
        observer.observe(cardContainer as Node, { childList: true });
      else 
        throw new Error(`Card container does not exist in DOM as ${cardContainerQuerySelector}`);
    });
  });

  //==========================================================================//
  //  Get Forwarder's Name and infoPage URL
  //==========================================================================//
  let has_next_page = false;
  let page_count = 1;

  // For Each List Page
  do {

    // Get Card
    result.push(...await page.evaluate(() => {
      const forwarder_card_element_list = Array.from(document.querySelectorAll('#forwarding-default-list > div > forwarder-box > a'));
      const forwarder_card_element_list_serialized = forwarder_card_element_list.map(el => ({
        url: el.getAttribute('href'),
        name: el.querySelector("div.company-name > h3")?.textContent
      }))
      return forwarder_card_element_list_serialized
    }))

    VERBOSE && console.log(`Page ${page_count} is parsed`)

    // Check if next page button is clickable 
    const xpath_next_page = '/html/body/application/div/forwarding/div/div/div[2]/pagination-controls/pagination-template/ul/li[6]'
    const element_list_next_page = await page.$x(xpath_next_page)
    has_next_page = ! await (await element_list_next_page[0].toElement('button')).evaluate(el => el.classList.contains('disabled'))

    if (has_next_page){

      //  click next page button
      await (await element_list_next_page[0].toElement('button')).click()

      //  Wait Until Card Container's Children Mutated
      await page.evaluate(() => {
        return new Promise<void>(resolve => {
          let cardContainer = document.querySelector("#forwarding-default-list");
          let observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
              if (mutation.type === 'childList') {
                resolve();
              }
            }
          })
          if(cardContainer)
            observer.observe(cardContainer, { childList: true });
        });
      });

      //  Increase page_count
      page_count++
    }
  } while (has_next_page)

  //==========================================================================//
  // Get Contact from Each forwarderURL
  //==========================================================================//

  for (let idx_forwarder = 0; idx_forwarder < result.length; idx_forwarder++) {
    const forwarder = result[idx_forwarder];

    if (forwarder.url) {
      while (true) {
        try {
          await page.goto(forwarder.url, { timeout: 10000 });
          break; 
        } catch (error) {
          console.log('Page load timed out, reloading...');
          continue;
        }
      }
      console.log('Page loaded')

      // get contact info
      result[idx_forwarder] = {
        ...result[idx_forwarder],
        ...(await page.evaluate(() => {
          return {
            address: document.querySelector('body > application > div > forwarding-detail > div > div.detail-area.ng-tns-c0-0.ng-star-inserted > div.forwarding-info-box > div > div.company-contact > div > ul:nth-child(1) > li:nth-child(2) > span')?.textContent?.replace(/\,/g,'-'),
            phone: document.querySelector('body > application > div > forwarding-detail > div > div.detail-area.ng-tns-c0-0.ng-star-inserted > div.forwarding-info-box > div > div.company-contact > div > ul:nth-child(2) > li:nth-child(2) > span')?.textContent?.replace(/\,/g,'-'),
            website: document.querySelector('body > application > div > forwarding-detail > div > div.detail-area.ng-tns-c0-0.ng-star-inserted > div.forwarding-info-box > div > div.company-contact > div > ul:nth-child(4) > li:nth-child(2) > a')?.textContent?.replace(/\,/g,'-'),
          }
        }, {}))
      }
    }
  }

  await browser.close();

  for (const forwarder of result) {
    result_string += `${forwarder.name},${forwarder.address},${forwarder.phone},${forwarder.website}\n`
  }

  await fsPromises.writeFile(`${__dirname}result.csv`,result_string);
}

main()
