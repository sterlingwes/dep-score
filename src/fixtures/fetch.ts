import fs from "fs";
import { getAbbreviatedPackument } from "query-registry";

const moduleName = process.argv[2];

console.log(`fetching abbreviated packument for ${moduleName}...`);

const get = async () => {
  try {
    const packument = await getAbbreviatedPackument(moduleName);
    fs.writeFileSync(
      `src/fixtures/${moduleName}.json`,
      JSON.stringify(packument, null, 2)
    );
  } catch (e) {
    console.error(e);
    console.log(`Unable to fetch packument for ${moduleName}`);
  }
};

get();
