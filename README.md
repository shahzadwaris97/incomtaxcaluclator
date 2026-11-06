# Money Tools — Starter Project

The app includes a toolkit homepage, five tools (income tax estimator, currency converter, global gold rates, salary take-home estimator, and monthly expense calculator), and a financial guides section with general educational explainers.

The currency converter uses reference rates from [ExchangeRate-API](https://www.exchangerate-api.com/). Gold rates use a USD spot quote from [Gold-API](https://gold-api.com/) converted using those reference exchange rates. Both rates require an internet connection and can be refreshed in the app. Gold estimates exclude local premiums, purity adjustments, taxes and jeweller fees.

## Run locally
1. Install Node.js (LTS) and VS Code.
2. Extract this ZIP.
3. Open the extracted `income-tax-calculator` folder in VS Code.
4. Open Terminal → New Terminal.
5. Run:

```bash
npm install
npm run dev
```

6. Open the local URL printed by Vite (usually http://localhost:5173).

## Deploy to Netlify

The Netlify build settings are in `netlify.toml` (`npm run build`, publish directory `dist`).

1. Push this project to a GitHub repository.
2. In Netlify, choose **Add new project** → **Import an existing project**, then connect the GitHub repository.
3. Keep the build settings from `netlify.toml` and choose **Deploy**.

Netlify will build and publish the site, and automatically redeploy whenever you push changes to the connected branch. You can also build locally with:

```bash
npm run build
```

## Current calculator scope
- Pakistan: salaried individual slabs, Tax Year 2026–27, based on the FBR Finance Bill 2026.
- UK: England, Wales and Northern Ireland basic income tax estimate; Scotland and personal allowance taper are not included.
- USA: federal estimate for single filers; state/local taxes, payroll taxes and credits are not included.
- Canada: federal tax only; provincial/territorial tax and credits are not included.
- Australia: resident rates; Medicare levy and offsets are not included.
- UAE: individual salary income tax estimated at 0%; corporate tax is not calculated.

## Important
This is a starter estimator, not tax advice or tax filing software. The country calculators are not fully comprehensive. Verify rates and individual circumstances with the relevant tax authority before publishing or relying on results. Update `src/tax.js` whenever official rules change. Add tax-year selectors, residency status, deductions, credits and jurisdiction-specific rules before treating any country calculator as comprehensive.

## Official references used for starter rules
- Pakistan FBR Finance Bill 2026: https://www.fbr.gov.pk/Budget2026-27/FinanceBill/Finance-Bill-2026.pdf
- IRS 2026 inflation adjustments: https://www.irs.gov/irb/2025-45_IRB
- UK GOV.UK income tax rates: https://www.gov.uk/income-tax-rates
- Canada CRA 2026 rates: https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html
- Australia legislation: https://www.legislation.gov.au/C2004A03348/2026-07-01/2026-07-01/text/original/epub/OEBPS/document_1/document_1.html
- UAE government taxation: https://u.ae/en/information-and-services/finance-and-investment/taxation
