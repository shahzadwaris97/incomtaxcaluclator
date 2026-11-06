import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp, ArrowUpRight, BookOpenText, Calculator, ChartNoAxesCombined,
  Coins, Download, Globe2, House, RefreshCw, ShieldCheck, Sparkles, Wallet,
} from 'lucide-react';
import { calculate, countries } from './tax.js';

const currencies = [
  ['USD', 'US Dollar'], ['PKR', 'Pakistani Rupee'], ['EUR', 'Euro'],
  ['GBP', 'British Pound'], ['AED', 'UAE Dirham'], ['CAD', 'Canadian Dollar'],
  ['AUD', 'Australian Dollar'], ['INR', 'Indian Rupee'], ['SAR', 'Saudi Riyal'],
  ['BDT', 'Bangladeshi Taka'], ['LKR', 'Sri Lankan Rupee'], ['CNY', 'Chinese Yuan'],
  ['JPY', 'Japanese Yen'], ['CHF', 'Swiss Franc'], ['SGD', 'Singapore Dollar'],
  ['NZD', 'New Zealand Dollar'], ['ZAR', 'South African Rand'], ['TRY', 'Turkish Lira'],
];
const pages = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'tax', label: 'Income Tax', icon: Calculator },
  { id: 'currency', label: 'Currency', icon: ArrowDownUp },
  { id: 'gold', label: 'Gold Rates', icon: Coins },
  { id: 'salary', label: 'Salary', icon: Wallet },
  { id: 'expenses', label: 'Expenses', icon: RefreshCw },
  { id: 'guides', label: 'Guides', icon: BookOpenText },
];
const toolCards = [
  { id: 'tax', title: 'Income tax', description: 'Estimate your tax bill across supported countries.', icon: Calculator, tag: '6 countries' },
  { id: 'currency', title: 'Currency converter', description: 'Convert currencies with current reference rates.', icon: ArrowDownUp, tag: '18 currencies' },
  { id: 'gold', title: 'Gold rates', description: 'Check gold spot prices by currency and weight.', icon: Coins, tag: 'Live reference' },
  { id: 'salary', title: 'Salary calculator', description: 'See estimated take-home pay after income tax.', icon: Wallet, tag: 'Net pay' },
  { id: 'expenses', title: 'Expense planner', description: 'Map monthly spending and see what remains.', icon: ChartNoAxesCombined, tag: 'Monthly budget' },
  { id: 'guides', title: 'Financial guides', description: 'Practical explainers for more confident decisions.', icon: BookOpenText, tag: 'Learn the basics' },
];
const guides = [
  { title: 'A simple way to build a monthly budget', category: 'BUDGETING', icon: ChartNoAxesCombined, text: 'Start with take-home income, cover essentials, set aside savings, then give flexible spending a clear limit.' },
  { title: 'What to gather before estimating your taxes', category: 'TAX BASICS', icon: Calculator, text: 'Check your tax residency, pay frequency and taxable income. Keep in mind that deductions and local taxes can change the final amount.' },
  { title: 'How to compare exchange rates', category: 'CURRENCY', icon: ArrowDownUp, text: 'Compare the provider’s final rate and fees, not just the headline rate. Reference rates are useful for a baseline, not a guaranteed offer.' },
  { title: 'Understanding gold spot prices', category: 'GOLD', icon: Coins, text: 'Spot prices are market references. Retail prices can also include purity, fabrication, taxes and local premiums.' },
];
const pakistanTaxFaqs = [
  {
    question: 'How much tax is estimated on a Rs 100,000 monthly salary in Pakistan?',
    answer: 'That is Rs 1,200,000 annual gross salary. Under this calculator’s current salaried-person tax-year 2026–27 assumptions, the estimated income tax is Rs 6,000 per year, or about Rs 500 per month. Actual liability can differ; verify applicable rates with the FBR.',
  },
  {
    question: 'What is the tax-free salary limit in this Pakistan calculator for 2026–27?',
    answer: 'The current Pakistan salaried estimate applies a 0% rate to the first Rs 600,000 of annual income. This reflects the calculator’s Finance Bill 2026 assumptions and is not a confirmation of your personal tax status. Check the enacted Finance Act and FBR guidance.',
  },
  {
    question: 'Can I calculate monthly and annual salary tax?',
    answer: 'Yes. Enter a gross monthly or annual salary and select the matching period. The calculator converts monthly pay to an annual amount for the estimate, then shows annual tax, monthly tax, effective tax rate and estimated take-home pay.',
  },
  {
    question: 'Which Pakistan income tax slabs and rates are used for 2026–27?',
    answer: 'The current estimate uses the salaried-person bands in this tool: 0% up to Rs 600,000; then 1%, 11%, 20%, 25%, 29%, 32% and 35% across progressively higher annual income bands. These are calculator assumptions based on Finance Bill 2026, not a substitute for confirming the enacted Finance Act or current FBR tax slabs.',
  },
  {
    question: 'Is this an official FBR tax calculator, and does it cover business income?',
    answer: 'No. It is an independent estimate for salaried individuals, not an official FBR tax calculator. Business income, non-salaried tax, withholding tax adjustments, deductions and individual credits are not calculated. Review the current FBR tax slabs and consult a qualified tax professional for your situation.',
  },
];
const pakistanTaxKeywords = [
  'income tax calculator',
  'salary tax calculator',
  'income tax calculator Pakistan',
  'salary tax calculator Pakistan',
  'FBR tax calculator',
  'Pakistan income tax calculator 2026',
  'salary tax calculator 2026–27',
  'monthly salary tax calculator Pakistan',
  'annual income tax calculator Pakistan',
  'take home salary calculator Pakistan',
  'FBR salaried tax calculator',
  'income tax slabs 2026–27 Pakistan',
  'tax on salary in Pakistan',
  'how much tax on 100000 salary Pakistan',
  'tax free salary limit Pakistan 2026',
  'income tax calculator for salaried persons',
  'business income tax calculator Pakistan',
  'non-salaried tax calculator Pakistan',
  'FBR tax slabs',
  'Finance Act 2026 tax slabs',
  'tax year 2027 Pakistan',
  'withholding tax on salary',
  'effective tax rate calculator',
  'take-home pay calculator',
  'salary after tax calculator',
  'Pakistan tax calculator online',
  'income tax rates Pakistan 2026',
];
const expenseTypes = ['Housing', 'Food', 'Transport', 'Utilities', 'Healthcare', 'Other'];
const GRAMS_PER_TROY_OUNCE = 31.1034768;
const GRAMS_PER_TOLA = 11.6638038;

const formatMoney = (value, currency, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

function CurrencySelect({ value, onChange, label }) {
  return (
    <label className="tool-field">
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>
        {currencies.map(([code, name]) => (
          <option value={code} key={code}>{code} — {name}</option>
        ))}
      </select>
    </label>
  );
}

function BackToTools({ onClick }) {
  return (
    <button className="back-to-tools" type="button" onClick={onClick}>
      <ArrowDownUp size={15} /> Back to all tools
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [code, setCode] = useState('PK');
  const [income, setIncome] = useState('2400000');
  const [period, setPeriod] = useState('year');
  const [salary, setSalary] = useState('2400000');
  const [salaryPeriod, setSalaryPeriod] = useState('year');
  const [expenses, setExpenses] = useState({
    Housing: '70000', Food: '45000', Transport: '18000',
    Utilities: '15000', Healthcare: '5000', Other: '10000',
  });
  const [expenseIncome, setExpenseIncome] = useState('240000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('PKR');
  const [convertAmount, setConvertAmount] = useState('1');
  const [fxData, setFxData] = useState(null);
  const [goldData, setGoldData] = useState(null);
  const [fxError, setFxError] = useState('');
  const [goldError, setGoldError] = useState('');
  const [fxLoading, setFxLoading] = useState(false);
  const [goldLoading, setGoldLoading] = useState(false);

  const country = countries[code];
  const openPakistanTax = () => {
    setCode('PK');
    setPage('tax');
    window.setTimeout(() => {
      document.getElementById('tool-content')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };
  const annualIncome = (Number(income) || 0) * (period === 'month' ? 12 : 1);
  const taxResult = useMemo(() => calculate(code, annualIncome), [code, annualIncome]);
  const annualSalary = (Number(salary) || 0) * (salaryPeriod === 'month' ? 12 : 1);
  const salaryTax = useMemo(() => calculate(code, annualSalary), [code, annualSalary]);
  const expenseTotal = expenseTypes.reduce((total, type) => total + (Number(expenses[type]) || 0), 0);
  const monthlyAvailable = (Number(expenseIncome) || 0) - expenseTotal;

  const loadFxRates = useCallback(async () => {
    setFxLoading(true);
    setFxError('');
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error('Currency rates are temporarily unavailable.');
      const data = await response.json();
      const rates = data.conversion_rates || data.rates;
      if (data.result !== 'success' || !rates || !Number.isFinite(rates.PKR)) {
        throw new Error('The currency service returned invalid rate data.');
      }
      setFxData({ rates, updatedAt: data.time_last_update_utc || data.date });
    } catch (error) {
      setFxError(error instanceof Error ? error.message : 'Could not load currency rates.');
    } finally {
      setFxLoading(false);
    }
  }, []);

  const loadGoldPrice = useCallback(async () => {
    setGoldLoading(true);
    setGoldError('');
    try {
      const response = await fetch('https://api.gold-api.com/price/XAU');
      if (!response.ok) throw new Error('Gold prices are temporarily unavailable.');
      const data = await response.json();
      if (!Number.isFinite(data.price) || data.price <= 0) {
        throw new Error('The gold service returned invalid price data.');
      }
      setGoldData({ priceUsd: data.price, updatedAt: data.updatedAtReadable || data.updatedAt });
    } catch (error) {
      setGoldError(error instanceof Error ? error.message : 'Could not load gold prices.');
    } finally {
      setGoldLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFxRates();
    loadGoldPrice();
  }, [loadFxRates, loadGoldPrice]);

  const money = value => formatMoney(value, country.currency, 0);
  const downloadEstimate = () => {
    const text = [
      'Income Tax Estimate',
      `Country: ${country.name}`,
      `Tax period: ${country.period}`,
      `Annual income: ${money(annualIncome)}`,
      `Estimated annual tax: ${money(taxResult.tax)}`,
      `Estimated monthly tax: ${money(taxResult.tax / 12)}`,
      `Estimated annual take-home: ${money(annualIncome - taxResult.tax)}`,
      `Disclaimer: ${country.note}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'income-tax-estimate.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  const currencyRate = fxData?.rates?.[toCurrency] && fxData?.rates?.[fromCurrency]
    ? fxData.rates[toCurrency] / fxData.rates[fromCurrency]
    : null;
  const convertedAmount = currencyRate === null ? null : (Number(convertAmount) || 0) * currencyRate;
  const goldRate = currency => {
    const usdRate = fxData?.rates?.[currency];
    return goldData && usdRate ? goldData.priceUsd * usdRate : null;
  };

  return (
    <>
      <header>
        <div className="nav">
          <a
            className="brand"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setPage('home');
            }}
          >
            <span className="brandIcon"><Calculator size={21} /></span>
            Money<span>Tools</span>
          </a>
          <nav className="tool-nav" aria-label="Money tools">
            {pages.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                className={page === id ? 'selected' : ''}
                aria-current={page === id ? 'page' : undefined}
                onClick={() => setPage(id)}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </nav>
          <button className="navBtn" onClick={() => document.getElementById('tool-content')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore tools <ArrowUpRight size={16} />
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-layout">
            <div className="hero-copy">
              <div className="eyebrow"><Globe2 size={15} /> YOUR INTERNATIONAL FINANCIAL TOOLKIT</div>
              <h1>Make money moves.<br /><em>With more clarity.</em></h1>
              <p>Useful calculators and straightforward guides for wherever life takes you.</p>
              <div className="heroTags"><span>Free to use</span><span>Easy estimates</span><span>Mobile friendly</span></div>
            </div>
            <img className="hero-illustration" src="/finance-hero.svg" alt="" aria-hidden="true" />
          </div>
        </section>

        <div id="tool-content">
          {page === 'home' && (
            <section className="home-content">
              <div className="home-intro">
                <div>
                  <div className="eyebrow"><Sparkles size={14} /> MONEY TOOLS, MADE SIMPLE</div>
                  <h2>Make your next move<br />a more informed one.</h2>
                  <p>Explore practical tools for everyday money questions—from your paycheck to prices around the world.</p>
                  <button className="primary" onClick={() => setPage('tax')}>Try the tax calculator <ArrowUpRight size={16} /></button>
                </div>
                <div className="home-visual" aria-label="Illustration of financial planning tools">
                  <img className="toolkit-illustration" src="/finance-toolkit.svg" alt="" aria-hidden="true" />
                  <div className="visual-chip chip-tax"><Calculator size={16} /> Tax estimate</div>
                  <div className="visual-chip chip-currency"><ArrowDownUp size={16} /> FX rates</div>
                  <div className="visual-chip chip-gold"><Coins size={16} /> Gold price</div>
                </div>
              </div>

              <div className="section-heading">
                <div><div className="eyebrow">EXPLORE THE TOOLKIT</div><h2>What would you like to work out?</h2></div>
                <span><ShieldCheck size={16} /> Free tools, clear assumptions</span>
              </div>
              <div className="tool-card-grid">
                {toolCards.map(({ id, title, description, icon: Icon, tag }) => (
                  <button className="tool-card" type="button" key={id} onClick={() => setPage(id)}>
                    <span className="tool-card-icon"><Icon size={20} /></span>
                    <span className="tool-card-tag">{tag}</span>
                    <strong>{title}</strong>
                    <span className="tool-card-description">{description}</span>
                    <span className="tool-card-link">Open tool <ArrowUpRight size={15} /></span>
                  </button>
                ))}
              </div>
              <section className="pakistan-tax-seo" aria-labelledby="pakistan-tax-heading">
                <div className="eyebrow">PAKISTAN · TAX YEAR 2026–27</div>
                <h2 id="pakistan-tax-heading">Pakistan income tax and salary tax calculator</h2>
                <p>Use this online Pakistan income tax calculator to estimate salaried-person tax from a monthly or yearly gross salary. It works as a salary tax calculator and salary-after-tax calculator, showing annual and monthly tax, effective tax rate and estimated take-home pay. It is a starting point for questions like “tax on salary in Pakistan” and “take-home salary calculator Pakistan”—not an official FBR assessment.</p>
                <button className="seo-tax-link" type="button" onClick={() => setPage('tax')}>Calculate Pakistan salary tax <ArrowUpRight size={16} /></button>
                <div className="pakistan-tax-faqs">
                  <h3>Pakistan salary tax calculator: common questions</h3>
                  {pakistanTaxFaqs.map(({ question, answer }) => (
                    <details key={question}>
                      <summary>{question}</summary>
                      <p>{answer}</p>
                    </details>
                  ))}
                </div>
                <div className="tax-keywords">
                  <h3>Related Pakistan tax calculators and topics</h3>
                  <div className="tax-keyword-list">
                    {pakistanTaxKeywords.map(keyword => (
                      <a
                        key={keyword}
                        href="#tool-content"
                        onClick={event => {
                          event.preventDefault();
                          openPakistanTax();
                        }}
                      >
                        {keyword}
                      </a>
                    ))}
                  </div>
                </div>
                <p className="disclaimer">Rates and tax slabs shown here are based on the calculator’s Finance Bill 2026 salaried-person assumptions for 2026–27. This tool does not calculate business or non-salaried income, withholding tax adjustments or personal deductions. Check the enacted Finance Act and current FBR guidance before relying on an estimate.</p>
              </section>
              <div className="home-note"><ShieldCheck size={18} /><p><b>A helpful starting point, not financial advice.</b> Rates and estimates are indicative. Always check official sources and provider terms before making decisions.</p></div>
            </section>
          )}

          {page === 'tax' && (
            <section className="calculatorWrap">
              <BackToTools onClick={() => setPage('home')} />
              <div className="calcHead">
                <div>
                  <div className="eyebrow">INCOME TAX CALCULATOR</div>
                  <h2>Calculate your income tax</h2>
                  <p>Select your country and enter your salary to get an estimate.</p>
                </div>
                <span className="live"><i /> Live calculator</span>
              </div>
              <div className="calcGrid">
                <div className="formPanel">
                  <label htmlFor="tax-country">Choose country</label>
                  <select id="tax-country" value={code} onChange={event => setCode(event.target.value)}>
                    {Object.entries(countries).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}
                  </select>
                  <div className="periodTitle">
                    <label>Income amount</label>
                    <div className="toggle">
                      <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>Annual</button>
                      <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Monthly</button>
                    </div>
                  </div>
                  <div className="inputBox">
                    <span>{country.symbol}</span>
                    <input type="number" min="0" value={income} onChange={event => setIncome(event.target.value)} placeholder="Enter your salary" aria-label="Gross income" />
                  </div>
                  <small>Enter your gross salary before income tax.</small>
                  <div className="periodNote"><b>{country.period}</b><p>{country.note}</p></div>
                  <div className="actions">
                    <button className="primary" onClick={downloadEstimate}><Download size={17} /> Download estimate</button>
                    <button className="reset" onClick={() => { setIncome(''); setPeriod('year'); }}><RefreshCw size={16} /> Reset</button>
                  </div>
                </div>
                <div className="resultPanel">
                  <div className="resultLabel">ESTIMATED ANNUAL TAX</div>
                  <div className="taxAmount">{money(taxResult.tax)}</div>
                  <div className="resultSub">Based on {money(annualIncome)} annual income</div>
                  <div className="resultRows">
                    <div><span>Annual gross income</span><b>{money(annualIncome)}</b></div>
                    <div><span>Taxable income used</span><b>{money(taxResult.taxable)}</b></div>
                    <div><span>Effective tax rate</span><b>{(taxResult.effective * 100).toFixed(2)}%</b></div>
                    <div><span>Monthly tax estimate</span><b>{money(taxResult.tax / 12)}</b></div>
                  </div>
                  <div className="takehome"><span>Estimated annual take-home</span><strong>{money(annualIncome - taxResult.tax)}</strong></div>
                  <div className="bar"><i style={{ width: `${Math.min(100, taxResult.effective * 100)}%` }} /></div>
                  <div className="barLegend"><span>Take-home pay</span><span>Income tax</span></div>
                </div>
              </div>
              <p className="disclaimer">This tool provides an estimate, not tax, legal or accounting advice. Actual liability may vary based on residency, filing status, deductions, credits, provincial/state taxes and other rules. Verify with the relevant tax authority or a qualified professional.</p>
              <div className="countries" id="countries">
                <div className="eyebrow">SUPPORTED MARKETS</div>
                <h2>One calculator. Multiple countries.</h2>
                <p>Choose a country to view the relevant tax estimate and currency.</p>
                <div className="countryGrid">
                  {Object.entries(countries).map(([key, value]) => (
                    <button key={key} className={code === key ? 'country activeCountry' : 'country'} onClick={() => setCode(key)}>
                      <span>{({ PK: '🇵🇰', US: '🇺🇸', UK: '🇬🇧', AE: '🇦🇪', CA: '🇨🇦', AU: '🇦🇺' })[key]}</span>
                      <b>{value.name}</b><small>{value.currency}</small><ArrowUpRight size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {page === 'currency' && (
            <section className="calculatorWrap tool-page">
              <BackToTools onClick={() => setPage('home')} />
              <div className="eyebrow">CURRENCY CONVERTER</div>
              <h2>Convert currencies at a glance</h2>
              <p className="tool-intro">Compare an amount using the latest available reference exchange rates.</p>
              <div className="converter-grid">
                <label className="tool-field"><span>Amount</span><input type="number" min="0" value={convertAmount} onChange={event => setConvertAmount(event.target.value)} /></label>
                <CurrencySelect label="From" value={fromCurrency} onChange={setFromCurrency} />
                <button className="swap-button" aria-label="Swap currencies" onClick={swapCurrencies}><ArrowDownUp size={19} /></button>
                <CurrencySelect label="To" value={toCurrency} onChange={setToCurrency} />
              </div>
              <div className="conversion-result">
                <span>{Number(convertAmount) || 0} {fromCurrency} equals</span>
                <strong>{convertedAmount === null ? '—' : formatMoney(convertedAmount, toCurrency)}</strong>
                <small>{currencyRate === null ? 'Selected currency rate is unavailable.' : `1 ${fromCurrency} = ${formatMoney(currencyRate, toCurrency)} · Reference rate`}</small>
              </div>
              <div className="tool-footer">
                <span>{fxData ? `Rates updated ${fxData.updatedAt}` : (fxError || 'Loading currency rates…')}</span>
                <button className="reset" onClick={loadFxRates} disabled={fxLoading}><RefreshCw size={15} className={fxLoading ? 'spin' : ''} />{fxLoading ? 'Refreshing…' : 'Refresh rates'}</button>
              </div>
              {fxError && <p className="tool-error" role="alert">{fxError}</p>}
              <p className="disclaimer">Indicative rates are provided by ExchangeRate-API and may not match the rate offered by a bank, card provider or money-transfer service.</p>
            </section>
          )}

          {page === 'gold' && (
            <section className="calculatorWrap tool-page">
              <BackToTools onClick={() => setPage('home')} />
              <div className="eyebrow">GLOBAL GOLD RATES</div>
              <h2>Gold prices around the world</h2>
              <p className="tool-intro">See an indicative gold spot price converted into popular currencies and common weights.</p>
              <div className="gold-spot">
                <span>REFERENCE SPOT PRICE · USD / TROY OUNCE</span>
                <strong>{goldData ? formatMoney(goldData.priceUsd, 'USD') : '—'}</strong>
                <small>{goldData ? `Updated ${goldData.updatedAt}` : (goldError || 'Loading gold price…')}</small>
              </div>
              <div className="gold-table-wrap">
                <table className="gold-table">
                  <thead><tr><th>Currency</th><th>Per troy ounce</th><th>Per gram</th><th>Per tola</th></tr></thead>
                  <tbody>
                    {currencies.filter(([currency]) => ['USD', 'PKR', 'AED', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'SAR', 'BDT'].includes(currency)).map(([currency, name]) => {
                      const ounce = goldRate(currency);
                      return <tr key={currency}><td><b>{currency}</b><small>{name}</small></td><td>{ounce === null ? '—' : formatMoney(ounce, currency)}</td><td>{ounce === null ? '—' : formatMoney(ounce / GRAMS_PER_TROY_OUNCE, currency)}</td><td>{ounce === null ? '—' : formatMoney(ounce * GRAMS_PER_TOLA / GRAMS_PER_TROY_OUNCE, currency)}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="tool-footer">
                <span>{goldData ? 'Spot reference; local retail prices vary.' : (goldError || 'Loading gold price…')}</span>
                <button className="reset" onClick={() => { loadGoldPrice(); loadFxRates(); }} disabled={goldLoading || fxLoading}><RefreshCw size={15} className={goldLoading || fxLoading ? 'spin' : ''} /> Refresh prices</button>
              </div>
              {(goldError || fxError) && <p className="tool-error" role="alert">{[goldError, fxError].filter(Boolean).join(' ')}</p>}
              <p className="disclaimer">Reference estimates are based on a USD spot quote converted at indicative exchange rates. They exclude local premiums, purity adjustments, taxes and jeweller fees. One troy ounce is 31.1035 g; one tola is approximately 11.6638 g.</p>
            </section>
          )}

          {page === 'salary' && (
            <section className="calculatorWrap tool-page">
              <BackToTools onClick={() => setPage('home')} />
              <div className="eyebrow">SALARY CONVERTER</div>
              <h2>Estimate your take-home pay</h2>
              <p className="tool-intro">Convert a gross salary into estimated net pay using the selected country’s tax estimate.</p>
              <div className="salary-controls">
                <label className="tool-field"><span>Country</span><select value={code} onChange={event => setCode(event.target.value)}>{Object.entries(countries).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}</select></label>
                <label className="tool-field"><span>Gross salary ({country.currency})</span><input type="number" min="0" value={salary} onChange={event => setSalary(event.target.value)} /></label>
                <div className="periodTitle"><label>Pay period</label><div className="toggle"><button className={salaryPeriod === 'year' ? 'active' : ''} onClick={() => setSalaryPeriod('year')}>Annual</button><button className={salaryPeriod === 'month' ? 'active' : ''} onClick={() => setSalaryPeriod('month')}>Monthly</button></div></div>
              </div>
              <div className="salary-results">
                <div><span>Estimated gross annual</span><b>{money(annualSalary)}</b></div>
                <div><span>Estimated annual tax</span><b>{money(salaryTax.tax)}</b></div>
                <div className="highlight"><span>Estimated net monthly</span><b>{money((annualSalary - salaryTax.tax) / 12)}</b></div>
                <div className="highlight"><span>Estimated net annual</span><b>{money(annualSalary - salaryTax.tax)}</b></div>
                <div><span>Effective tax rate</span><b>{(salaryTax.effective * 100).toFixed(2)}%</b></div>
              </div>
              <p className="disclaimer">{country.note} This is a simplified estimate and may exclude social contributions, insurance, regional taxes and personal deductions.</p>
            </section>
          )}

          {page === 'expenses' && (
            <section className="calculatorWrap tool-page">
              <BackToTools onClick={() => setPage('home')} />
              <div className="eyebrow">MONTHLY EXPENSE CALCULATOR</div>
              <h2>Plan your monthly spending</h2>
              <p className="tool-intro">Add your monthly take-home income and expenses to see what remains.</p>
              <label className="tool-field expense-income"><span>Monthly take-home income ({country.currency})</span><input type="number" min="0" value={expenseIncome} onChange={event => setExpenseIncome(event.target.value)} /></label>
              <div className="expense-grid">
                {expenseTypes.map(type => (
                  <label className="tool-field" key={type}>
                    <span>{type}</span>
                    <input type="number" min="0" value={expenses[type]} onChange={event => setExpenses(current => ({ ...current, [type]: event.target.value }))} />
                  </label>
                ))}
              </div>
              <div className="expense-summary">
                <div><span>Total monthly expenses</span><b>{money(expenseTotal)}</b></div>
                <div className={monthlyAvailable < 0 ? 'negative' : 'highlight'}><span>{monthlyAvailable < 0 ? 'Over budget' : 'Money left after expenses'}</span><b>{money(monthlyAvailable)}</b></div>
                <div><span>Income spent</span><b>{(Number(expenseIncome) > 0 ? expenseTotal / Number(expenseIncome) * 100 : 0).toFixed(1)}%</b></div>
              </div>
              <p className="disclaimer">This is a simple budgeting estimate, not financial advice. Expenses use your selected country’s currency ({country.currency}).</p>
            </section>
          )}

          {page === 'guides' && (
            <section className="calculatorWrap tool-page guides-page">
              <BackToTools onClick={() => setPage('home')} />
              <div className="eyebrow"><BookOpenText size={14} /> MONEY, MADE CLEARER</div>
              <h2>Financial guides for everyday decisions</h2>
              <p className="tool-intro">Short, practical explainers to help you understand the numbers behind common money questions.</p>
              <div className="guide-grid">
                {guides.map(({ title, category, icon: Icon, text }) => (
                  <article className="guide-card" key={title}>
                    <div className="guide-icon"><Icon size={19} /></div>
                    <span>{category}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
              <p className="disclaimer">These guides are general educational information, not personalized financial, tax or legal advice. Rules and costs vary by country and individual circumstances.</p>
            </section>
          )}
        </div>

        <section className="about" id="about">
          <h2>Simple tools. Clear decisions.</h2>
          <p>Currency and gold prices are indicative references. Tax and salary estimates are simplified and may not include every rule, fee or deduction. Check official sources before making financial decisions.</p>
        </section>
      </main>
      <footer>
        <div className="brand">Money<span>Tools</span></div>
        <p>Independent money calculators · Always verify rates and tax rules with official sources.</p>
        <small>© 2026 Money Tools. For estimates only.</small>
      </footer>
    </>
  );
}
