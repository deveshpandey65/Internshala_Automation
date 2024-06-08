const puppeteer = require('puppeteer');

let err_count = 0

async function apply(url, email, passwd, coverLetter,num) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    

    try {
        await login(page, url, email, passwd);
        await page.goto("https://internshala.com/internships/web-development-internship/", { waitUntil: 'networkidle2' });
        
        const internships = await page.$$eval(".individual_internship", (elements, nums) =>
            elements.slice(1, nums + 1).map(element =>
                element.getAttribute('internshipid')
            ), num 
        );
          
        for (let i = 0; i < internships.length; i++) {
            await page.goto("https://internshala.com/internships/web-development-internship/", { waitUntil: 'networkidle2' });
            await applyForInternship(page, coverLetter, internships[i], err_count);
        }

    } catch (error) {
        console.error('Error during internship application:', error);
    } finally {
        await browser.close();
    }
}

//Login to Internshala

async function login(page, url, email, passwd) {
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector('span[data-target="#login-modal"]');
        await page.click('span[data-target="#login-modal"]');

        await page.waitForSelector('input[id="modal_email"]');
        await page.type('input[id="modal_email"]', email);

        await page.waitForSelector('input[id="modal_password"]');
        await page.type('input[id="modal_password"]', passwd);

        await page.waitForSelector('button[id="modal_login_submit"]');
        await page.click('button[id="modal_login_submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    catch {
        try {
            await page.goto(url, { waitUntil: 'networkidle2' });

            await page.waitForSelector('span[data-target="#login-modal"]');
            await page.click('span[data-target="#login-modal"]');

            await page.waitForSelector('input[id="modal_email"]');
            await page.type('input[id="modal_email"]', email);

            await page.waitForSelector('input[id="modal_password"]');
            await page.type('input[id="modal_password"]', passwd);

            await page.waitForSelector('button[id="modal_login_submit"]');
            await page.click('button[id="modal_login_submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }
        catch (err) {
            res.send("Incorrect Login Credentials")
            console.log("Login Err", err)
        }
    }

}

async function applyForInternship(page, coverLetter, internshipId, err_count) {
    try {
        await page.waitForSelector(`div[id="individual_internship_${internshipId}"]`);
        await page.click(`div[id="individual_internship_${internshipId}"]`);

        // Continue button
        try {
            await page.waitForSelector('button[id="continue_button"]', { timeout: 10000 });
            await page.click('button[id="continue_button"]');
        }
        catch (err) {
            try {
                await page.waitForSelector(`div[id="individual_internship_${internshipId}"]`, { timeout: 10000 });
                await page.click(`div[id="individual_internship_${internshipId}"]`);
                await page.waitForSelector('button[id="continue_button"]', { timeout: 10000 });
                await page.click('button[id="continue_button"]');
            }
            catch (err) {
                console.log("Error During Clicking at internship:", err)
                err_count = err_count+1
                return
            }

        }
        //Cover Letter Section
        const coverletter = await page.$('textarea[id="cover_letter"]')

        try {
            await page.waitForSelector('textarea[id="cover_letter"]');

            await page.evaluate(() => {
                const textarea = document.querySelector('textarea[id="cover_letter"]');
                textarea.style.display = 'block';
            });
            await page.type('textarea[id="cover_letter"]', coverLetter);

        }
        catch (err) {
            console.log("Cover letter Error:", err)
        }
        const check = await page.$('label[for="check"]')
        if (check) {
            await page.waitForSelector('label[for="check"]');
            await page.click('label[for="check"]');
        }

        const work_sample = await page.$('div[id="auto_resize_height_5502216"]');
        if (work_sample) {
            await page.waitForSelector('textarea[id="text_5502216"]');
            await page.evaluate(() => {
                const textarea = document.querySelector('textarea[id="text_5502216"]');
                textarea.style.display = 'block';
            });
            await work_sample.focus();
            await page.keyboard.type('None');
        }

        await fillEmptyInputFields(page);


        await page.waitForSelector('input[id="submit"]');
        await page.click('input[id="submit"]');

        await page.screenshot({ path: `intern-${internshipId}.png` });

    }
    catch (err) {
        console.log("Error:", err)
    }
}
async function fillEmptyInputFields(page) {
    const inputFields = await page.$$('textarea');

    for (const inputField of inputFields) {
        const isEmpty = await inputField.evaluate(element => element.value.trim() === '');
        if (isEmpty) {
            await inputField.focus();
            await page.keyboard.type('None');
        }
    }
}

module.exports= {
      apply,
      err_count
}