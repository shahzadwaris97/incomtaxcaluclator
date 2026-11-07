
export const countries = {
 PK:{name:'Pakistan',currency:'PKR',symbol:'Rs',period:'Tax Year 2026–27',note:'Salaried individuals; annual taxable salary for Tax Year 2027 (1 July 2026 to 30 June 2027). Based on Finance Act 2026.',brackets:[
 {limit:600000,rate:0,base:0},{limit:1200000,rate:.01,base:0},{limit:2200000,rate:.11,base:6000},{limit:3200000,rate:.20,base:116000},{limit:4100000,rate:.25,base:316000},{limit:5600000,rate:.29,base:541000},{limit:7000000,rate:.32,base:976000},{limit:Infinity,rate:.35,base:1424000}]},
 UK:{name:'United Kingdom',currency:'GBP',symbol:'£',period:'Tax Year 2026–27',note:'England, Wales and Northern Ireland estimate. Scotland has different bands; personal allowance taper and other income may change results.',allowance:12570,brackets:[{limit:37700,rate:.20,base:0},{limit:112570,rate:.40,base:7540},{limit:Infinity,rate:.45,base:37488}]},
 US:{name:'United States',currency:'USD',symbol:'$',period:'Tax Year 2026',note:'Federal estimate only for single filers. State/local taxes, credits, payroll taxes and deductions are not included.',allowance:16100,brackets:[{limit:12400,rate:.10,base:0},{limit:50400,rate:.12,base:1240},{limit:105700,rate:.22,base:5800},{limit:201775,rate:.24,base:17966},{limit:256225,rate:.32,base:41024},{limit:640600,rate:.35,base:58448},{limit:Infinity,rate:.37,base:192979.25}]},
 CA:{name:'Canada',currency:'CAD',symbol:'C$',period:'2026 calendar year',note:'Federal income tax only. Provincial/territorial tax and credits are not included.',brackets:[{limit:58523,rate:.14,base:0},{limit:117045,rate:.205,base:8193.22},{limit:181440,rate:.26,base:20190.23},{limit:258482,rate:.29,base:36992.93},{limit:Infinity,rate:.33,base:59375.11}]},
 AU:{name:'Australia',currency:'AUD',symbol:'A$',period:'2026–27 income year',note:'Australian resident rates. Medicare levy, offsets and other adjustments are not included.',allowance:18200,brackets:[{limit:45000,rate:.15,base:0},{limit:116800,rate:.30,base:6750},{limit:171800,rate:.37,base:28890},{limit:Infinity,rate:.45,base:49240}]},
 AE:{name:'United Arab Emirates',currency:'AED',symbol:'AED',period:'Current individual salary estimate',note:'The UAE does not levy personal income tax on individuals. Corporate tax is separate.',brackets:[{limit:Infinity,rate:0,base:0}]}
};
export function calculate(countryCode, annualIncome){
 const c=countries[countryCode];const income=Math.max(0,Number(annualIncome)||0);
 if(countryCode==='PK'){
   const b=c.brackets.find(x=>income<=x.limit)||c.brackets.at(-1);
   const tax=income<=600000?0:b.base+(income-(c.brackets[c.brackets.indexOf(b)-1]?.limit??600000))*b.rate;
   return {tax, taxable:income, effective:income?tax/income:0};
 }
 const taxable=Math.max(0,income-(c.allowance||0));
 let tax=0, lower=0;
 for(const b of c.brackets){const amount=Math.max(0,Math.min(taxable,b.limit)-lower);tax+=amount*b.rate;lower=b.limit;if(taxable<=b.limit)break;}
 return {tax,taxable,effective:income?tax/income:0};
}
