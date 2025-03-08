const puppeteer = require('puppeteer');

let err_count = 0
async function apply(url, email, passwd, coverLetter, num) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await login(page, url, email, passwd);
        console.log("✅ Login successful. Proceeding to Web Development Internship page...");

        await page.goto("https://internshala.com/internships/web-development-internship/", { waitUntil: 'networkidle2' });
        console.log("🔹 Web Development Internship page loaded.");

        const internships = await page.$$eval(".individual_internship", (elements, num) =>
            elements.slice(0, num).map(element => element.getAttribute('internshipid')),
            { num } 
        );

        if (!internships.length) {
            console.log("❌ No internships found.");
            return;
        }

        console.log(`🔹 Found ${internships.length} internships to apply for.`);
        console.log(internships);

        for (let i = 0; i < internships.length; i++) {
            const internshipUrl = `https://internshala.com/internship/detail/${internships[i]}`;
            try {
                await page.goto(internshipUrl, { waitUntil: 'networkidle2' });
                console.log(`🚀 Applying for internship ${i + 1} of ${internships.length}: ${internshipUrl}`);
                await applyForInternship(page, email, coverLetter, internships[i]);
            } catch (err) {
                console.error(`❌ Failed to apply for internship ${internships[i]}. Skipping...`, err);
            }
        }
    } catch (error) {
        console.error("❌ Error during internship application process:", error);
    } finally {
        await browser.close();
    }
}


// Login to Internshala
async function login(page, url, email, passwd) {
    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector('span[data-target="#login-modal"]');
        await page.click('span[data-target="#login-modal"]');

        await page.waitForSelector('input[id="modal_email"]', { visible: true });
        await page.type('input[id="modal_email"]', email);

        await page.waitForSelector('input[id="modal_password"]', { visible: true });
        await page.type('input[id="modal_password"]', passwd);

        console.log("🔹 Solve the CAPTCHA and click the 'Submit' button manually.");

        let currentUrl = page.url();
        console.log(`📌 Before login URL: ${currentUrl}`);

        await page.waitForFunction(
            oldUrl => document.location.href !== oldUrl,
            {},
            currentUrl
        );

        let newUrl = page.url();
        console.log(`✅ Login successful! Redirected to: ${newUrl}`);

    } catch (err) {
        console.error("❌ Login failed:", err);
    }
}





async function applyForInternship(page,email, coverLetter, internshipId) {
    try {
        await page.waitForSelector(`div[id="individual_internship_${internshipId}"]`);
        await page.click(`div[id="individual_internship_${internshipId}"]`);
        
        try {
            await page.waitForSelector('button[id="continue_button"]', { timeout: 10000 });
            await page.click('button[id="continue_button"]');
            err_count = err_count + 1
        }
        catch (err) {
            try {
                await page.waitForSelector(`div[id="individual_internship_${internshipId}"]`, { timeout: 10000 });
                await page.click(`div[id="individual_internship_${internshipId}"]`);
                await page.waitForSelector('button[id="continue_button"]', { timeout: 10000 });
                await page.click('button[id="continue_button"]');
                err_count = err_count + 1
            }
            catch (err) {
                console.log("Error During Clicking at internship:", err)
                
                return
            }

        }

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

        const resumeLabelSelector = 'label.custom-resume-label';
        const resumeLabel = await page.$(resumeLabelSelector);

        if (resumeLabel) {
            await page.waitForSelector(resumeLabelSelector);
            await page.click(resumeLabelSelector);

            const inputFileSelector = 'input[id="prefilled_custom_resume"]';
            await page.waitForSelector(inputFileSelector);

            const resumePath = path.resolve(__dirname, `upload/${email}.pdf`); // Adjust path to your PDF file
            const fileInput = await page.$(inputFileSelector);

            if (fileInput) {
                await fileInput.uploadFile(resumePath);
                console.log('File uploaded successfully.');
            } else {
                console.error('File input element not found');
            }
        } else {
            console.error('Resume upload label not found');
        }
    } catch (error) {
        console.error('Error uploading resume:', error);

        await fillEmptyInputFields(page);


        await page.waitForSelector('input[id="submit"]');
        await page.click('input[id="submit"]');

        await page.screenshot({ path: `intern-${internshipId}.png` });

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