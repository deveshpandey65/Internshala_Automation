const puppeteer = require('puppeteer')
async function run() {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage();
    await page.goto("https://thinklay.com");
    const images = await page.$$eval('img', (eles) => eles.map((ele) => ({
        src: ele.src,
        alt: ele.alt,
    })))
    const links = await page.$$eval('a', (links) => links.map((link) => ({
        href: link.href,
        text: link.textContent,
    })))
    const imagesCount = images.length;
    const linksCount = links.length;
    const output = JSON.stringify({ images, links, imagesCount, linksCount })
    console.log(output)
    await browser.close()
}
run();