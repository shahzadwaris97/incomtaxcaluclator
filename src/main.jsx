import React, { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import './tools.css';
import './routes.css';

const origin = 'https://pakistantaxcaluclator.netlify.app';
const routeInfo = {
  '/': {
    title: 'Pakistan Tax Calculator & Personal Finance Tools | Money Tools',
    description: 'Explore tax and salary estimators, currency conversion, gold price references, monthly budgeting tools and practical financial guides.',
    appPage: 'home',
    heading: null,
  },
  '/income-tax-calculator/': {
    title: 'Pakistan Income Tax Calculator | Money Tools',
    description: 'Estimate salaried-person income tax using the assumptions shown in the calculator. Pakistan results use its stated Tax Year 2026–27 scope; this is an independent estimate, not an official FBR service.',
    appPage: 'income tax',
    heading: 'Income tax calculator',
    intro: 'Estimate income tax by selecting a country and entering annual or monthly gross income. Pakistan results use the salaried-person assumptions already documented in this calculator for Tax Year 2026–27. The estimate does not replace official guidance or personal tax advice.',
  },
  '/currency-converter/': {
    title: 'Currency Converter with Reference Rates | Money Tools',
    description: 'Convert amounts across supported currencies using the available reference exchange-rate feed. Compare final provider rates and fees before sending money.',
    appPage: 'currency',
    heading: 'Currency converter',
    intro: 'Convert an amount between currencies supported by the existing tool. Rates are reference values and may differ from those offered by banks, card providers or money-transfer services.',
  },
  '/gold-rates/': {
    title: 'Gold Spot Price References by Currency and Weight | Money Tools',
    description: 'View indicative gold spot-price references converted by currency and common weights. Local retail prices can differ due to purity, premiums, taxes and other costs.',
    appPage: 'gold rates',
    heading: 'Gold rate references',
    intro: 'Explore the existing USD spot-price reference and currency conversions by troy ounce, gram and tola. These indicative calculations are not local retail quotes and exclude local premiums, purity adjustments, taxes and jewellery costs.',
  },
  '/salary-calculator/': {
    title: 'Salary Calculator: Estimate Take-Home Pay | Money Tools',
    description: 'Estimate net monthly and annual pay from gross salary using the calculator’s stated country-specific income-tax scope and assumptions.',
    appPage: 'salary',
    heading: 'Salary calculator',
    intro: 'Enter gross salary and choose a country and pay period to see estimated annual tax and take-home pay. Results use the scope described by the calculator and may exclude deductions, social contributions or regional taxes.',
  },
  '/expense-planner/': {
    title: 'Monthly Expense Planner and Budget Calculator | Money Tools',
    description: 'Plan monthly spending by entering take-home income and expenses, then review total outgoings, remaining funds and the share of income spent.',
    appPage: 'expenses',
    heading: 'Monthly expense planner',
    intro: 'Enter monthly take-home income and spending categories to see total outgoings and what remains. This planner totals the amounts you provide; it does not prescribe a budget or provide financial advice.',
  },
  '/financial-guides/': {
    title: 'Financial Guides: Budgeting, Tax, Currency and Gold | Money Tools',
    description: 'Read practical introductory guides on monthly budgeting, preparing to estimate taxes, comparing exchange rates and understanding gold spot prices.',
    appPage: 'guides',
    heading: 'Financial guides',
    intro: 'Browse the existing explainers on budgeting, tax estimates, exchange rates and gold spot prices. These are general educational resources, not personalized tax, legal or financial advice.',
  },
};
const navigation = [
  ['Home', '/'], ['Income Tax', '/income-tax-calculator/'], ['Currency', '/currency-converter/'],
  ['Gold Rates', '/gold-rates/'], ['Salary', '/salary-calculator/'],
  ['Expenses', '/expense-planner/'], ['Guides', '/financial-guides/'],
];

function setMeta(selector, attribute, value, key) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = value;
}

function SeoRoutes() {
  const pathname = window.location.pathname === '/' ? '/' : `/${window.location.pathname.split('/').filter(Boolean).join('/')}/`;
  const current = useMemo(() => routeInfo[pathname] || routeInfo['/'], [pathname]);

  useEffect(() => {
    const canonical = `${origin}${pathname}`;
    document.title = current.title;
    setMeta('meta[name="description"]', 'name', current.description, 'description');
    setMeta('meta[name="robots"]', 'name', 'index, follow, max-image-preview:large', 'robots');
    setMeta('meta[property="og:title"]', 'property', current.title, 'og:title');
    setMeta('meta[property="og:description"]', 'property', current.description, 'og:description');
    setMeta('meta[property="og:type"]', 'property', 'website', 'og:type');
    setMeta('meta[property="og:url"]', 'property', canonical, 'og:url');
    setMeta('meta[property="og:site_name"]', 'property', 'Money Tools', 'og:site_name');
    setMeta('meta[name="twitter:card"]', 'name', 'summary', 'twitter:card');
    setMeta('meta[name="twitter:title"]', 'name', current.title, 'twitter:title');
    setMeta('meta[name="twitter:description"]', 'name', current.description, 'twitter:description');
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.append(canonicalLink);
    }
    canonicalLink.href = canonical;
    document.body.dataset.route = current.appPage;

    // Keep the existing calculator as the source of all tools and calculations;
    // select its corresponding panel on first load at the SEO route.
    const selectExistingPanel = () => {
      const button = [...document.querySelectorAll('.tool-nav button')]
        .find(item => item.textContent.trim().toLowerCase() === current.appPage);
      if (button && !button.classList.contains('selected')) button.click();
    };
    const timer = window.setTimeout(selectExistingPanel, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, current]);

  useEffect(() => {
    const updateRouteFromExistingApp = () => {
      const selected = document.querySelector('.tool-nav button.selected');
      const label = selected?.textContent.trim().toLowerCase();
      const route = navigation.find(([name]) => name.toLowerCase() === label)?.[1];
      if (route && window.location.pathname !== route) window.history.replaceState({}, '', route);
    };
    const observer = new MutationObserver(updateRouteFromExistingApp);
    observer.observe(document.getElementById('root'), { subtree: true, attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="seo-route-nav" aria-label="Site pages">
        {navigation.map(([label, href]) => (
          <a href={href} key={href} aria-current={pathname === href ? 'page' : undefined}>{label}</a>
        ))}
      </nav>
      {current.heading && (
        <section className="route-intro" aria-labelledby="route-heading">
          <h1 id="route-heading">{current.heading}</h1>
          <p>{current.intro}</p>
          <p className="route-related">Explore related tools: {navigation.filter(([, href]) => href !== pathname && href !== '/').map(([label, href], index) => (
            <React.Fragment key={href}>{index ? ' · ' : ''}<a href={href}>{label}</a></React.Fragment>
          ))}</p>
        </section>
      )}
      <App />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><SeoRoutes /></React.StrictMode>,
);
