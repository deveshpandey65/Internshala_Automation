const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    // Go to the website
    await page.goto('https://sih.gov.in/sih2024PS?technology_bucket=QWxs&category=U29mdHdhcmU=&organization=QWxs&organization_type=QWxs');

    // Select the option to show 100 rows per page
    await page.waitForSelector('.custom-select.custom-select-sm.form-control.form-control-sm');
    await page.select('.custom-select.custom-select-sm.form-control.form-control-sm', '100');

    // Wait for the table rows to load
    await page.waitForSelector('td');

    // Extract the row containing the cell with "79"
    const rowDetails = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        let result = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                if (cell.innerText.trim() === '79') {
                    // If the '79' is found, extract the entire row's details
                    const details = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
                    result.push(details);
                }
            });
        });

        return result;
    });

    // Save the text to a file
    fs.writeFileSync('rowDetails79.txt', JSON.stringify(rowDetails, null, 2), 'utf-8');

    // Close the browser
    await browser.close();
})();
