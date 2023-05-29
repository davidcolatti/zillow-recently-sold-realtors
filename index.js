import { arrayToCsvFile } from "csv-to-and-from-array";

import getPropertyByZpid from "./getPropertyByZpid.js";
import getRecentlySoldHomes from "./getRecentlySoldHomes.js";

// Find list of recently sold homes by using zillow url slug (check their website)
const zpids = await getRecentlySoldHomes("san-diego-ca");

console.log(`Total ZPIDs found ${zpids.length}`);

// Use zpids that were scraped from recently sold homes to get property data
const promises = zpids.map(getPropertyByZpid);
const response = await Promise.all(promises);
const data = response.filter(Boolean);

console.log(data);

arrayToCsvFile({
  data,
  filePath: "./output.csv",
  callback: () => console.log(`Scrape completed`),
});
