const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 10000; // Dynamische Portkonfiguration

// Funktion zum Absenden eines Formulars mit einer gegebenen Kennzeichennummer
async function submitForm(kennzeichen) {
    // Aktuelles Datum für die Formulareingabe abrufen
    const heute = new Date();
    const tag = heute.getDate().toString().padStart(2, '0');
    const monat = (heute.getMonth() + 1).toString();
    const jahr = heute.getFullYear().toString();

    // Starten des Puppeteer-Browsers im Headless-Modus
    const browser = await puppeteer.launch({ headless: false }); // geändert zu Headless-Modus
    const page = await browser.newPage();

    // Hier bleibt der Rest Ihrer Funktion unverändert
    // Navigating to the specified URL
    await page.goto('https://kfa.vvo.at/ZLANeu/Pruefe', { waitUntil: 'networkidle0' });

    // Clicking the "Continue" button once it's available
    await page.waitForSelector('a[href="KZSuche"]');
    await page.click('a[href="KZSuche"]');

    // Waiting for the 'damage' checkbox and clicking it
    await page.waitForSelector('input[name="schaden"]');
    await page.click('input[name="schaden"]');

    // Entering the license plate number
    await page.waitForSelector('input[name="kfzKennzeichen"]');
    await page.type('input[name="kfzKennzeichen"]', kennzeichen);

    // Entering the accident date details
    await page.waitForSelector('input[name="unfalltag"]');
    await page.type('input[name="unfalltag"]', tag);
    await page.waitForSelector('select[name="unfallmonat"]');
    await page.select('select[name="unfallmonat"]', monat);
    await page.waitForSelector('input[name="unfalljahr"]');
    await page.type('input[name="unfalljahr"]', jahr);

    // Submitting the form
    await page.evaluate(() => document.formular.submit());

    // Waiting for the navigation after form submission
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Checking for error messages
    const errorElement = await page.$('.errorDIV');
    let resultText = "This license plate is taken!";

    if (errorElement) {
        const errorText = await page.evaluate(el => el.textContent, errorElement);
        if (errorText.includes("Zum angegebenen Unfalldatum war kein Fahrzeug mit diesem Kennzeichen zugelassen")) {
            resultText = "License plate is available!";
        }
    }

    // Schließen des Browsers
    await browser.close();
    return resultText;
}

app.get('/:kennzeichen', async (req, res) => {
    const kennzeichen = req.params.kennzeichen;
    try {
        const result = await submitForm(kennzeichen);
        res.json({ success: true, message: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`https://test6-enps.onrender.com${PORT}`);
});
