const puppeteer = require('puppeteer');

async function scrapeImages(url) {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to the specified URL
    await page.goto(url, { waitUntil: 'load', timeout: 0 });

    // Scrape the image sources
    const imageUrls = await page.evaluate(() => {
        // Select all image elements and get their src attribute
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => img.src).filter(src => src);
    });

    // Close the browser
    await browser.close();

    // Return the list of image URLs
    return imageUrls;
}

// Example usage
scrapeImages('https://www.flipkart.com/peter-england-single-breasted-2-button-checkered-men-suit/p/itmcf67831f5d95c?pid=SUIGKFGHFFC3CCNG&lid=LSTSUIGKFGHFFC3CCNGAKF03W&marketplace=FLIPKART&q=coat%20pant%203%20piece%20for%20men&sattr[]=color&sattr[]=size&st=size&otracker=AS_QueryStore_OrganicAutoSuggest_1_18_na_na_ps').then(imageUrls => {
    console.log('Scraped image URLs:', imageUrls);
}).catch(error => {
    console.error('Error scraping images:', error);
});
