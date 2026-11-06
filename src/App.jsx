import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp, ArrowUpRight, Calculator, Coins, Download, Globe2, RefreshCw,
  Wallet,
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
  { id: 'tax', label: 'Income Tax', icon: Calculator },
  { id: 'currency', label: 'Currency', icon: ArrowDownUp },
  { id: 'gold', label: 'Gold Rates', icon: Coins },
  { id: 'salary', label: 'Salary', icon: Wallet },
  { id: 'expenses', label: 'Expenses', icon: RefreshCw },
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

export default function App() {
  const [page, setPage] = useState('tax');
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
          <a className="brand" href="#" onClick={() => setPage('tax')}>
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
            Open tool <ArrowUpRight size={16} />
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow"><Globe2 size={15} /> GLOBAL MONEY TOOLS</div>
          <h1>Make money moves.<br /><em>With more clarity.</em></h1>
          <p>Tax, currency, gold, salary and expense tools in one place.</p>
          <div className="heroTags"><span>Free to use</span><span>Easy estimates</span><span>Mobile friendly</span></div>
        </section>

        <div id="tool-content">
          {page === 'tax' && (
            <section className="calculatorWrap">
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
