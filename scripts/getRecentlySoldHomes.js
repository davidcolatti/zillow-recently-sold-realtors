import fetchZillowWithProxy from "./fetchZillowWithProxy.js";

// const TOTAL_PAGE_COUNT = 20;
const TOTAL_PAGE_COUNT = 1;

const getZpids = async (cityStateSlug, page) => {
  while (true) {
    // to attempt to get page data
    const zillowUrl = `https://www.zillow.com/${cityStateSlug}/sold/${page}_p/`;

    console.log({
      zillowUrl,
      message: `getting recently sold homes for page ${page} / ${TOTAL_PAGE_COUNT}`,
    });

    try {
      const response = await fetchZillowWithProxy(zillowUrl);

      const html = await response.text();

      if (html.includes("Please verify you're a human to continue")) {
        throw new Error("blocked request");
      }

      if (
        html.includes(
          "Press & Hold to confirm you are<br>a human (and not a bot)."
        )
      ) {
        throw new Error("blocked by captcha");
      }

      const htmlZpids1 = html.split('searchListZpids","')[1];
      const htmlZpids2 = htmlZpids1.split('"],')[0];
      const zpids = JSON.parse(htmlZpids2);

      return zpids;
    } catch (error) {
      console.error({
        zillowUrl,
        message: error?.message,
      });
    }
  }
};

export default async function (cityStateSlug) {
  const promises = new Array(TOTAL_PAGE_COUNT).fill(null).map((_, index) => {
    return getZpids(cityStateSlug, index + 1);
  });

  const responses = await Promise.all(promises);
  return responses.flat().filter(Boolean);
}
