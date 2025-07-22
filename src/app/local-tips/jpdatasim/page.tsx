"use client";

import { useEffect } from "react";

export default function JpDataSimInfographic() {
  useEffect(() => {
    // Chart.js loader
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.async = true;
    script.onload = () => {
      // Chart rendering logic
      const tooltipTitleCallback = function(tooltipItems) {
        const item = tooltipItems[0];
        let label = item.chart.data.labels[item.dataIndex];
        if (Array.isArray(label)) {
          return label.join(" ");
        } else {
          return label;
        }
      };
      const brilliantBlues = {
        darkBlue: '#004AAD',
        midBlue: '#0062E3',
        lightBlue: '#418FFF',
        paleBlue: '#89B9FF',
        backgroundBlue: '#C9DAF8'
      };
      const greenShades = {
        safe: 'rgba(22, 163, 74, 0.8)',
        background: 'rgba(22, 163, 74, 0.2)'
      };
      const redShades = {
        risk: 'rgba(220, 38, 38, 0.8)',
        background: 'rgba(220, 38, 38, 0.2)'
      };
      const processLabel = (label) => {
        const maxLength = 16;
        if (label.length <= maxLength) return label;
        const words = label.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
          if ((currentLine + ' ' + word).trim().length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word;
          } else {
            currentLine = (currentLine + ' ' + word).trim();
          }
        }
        if (currentLine) lines.push(currentLine.trim());
        return lines;
      };
      // Prepaid Risk Chart
      new window.Chart(document.getElementById('prepaidRiskChart'), {
        type: 'doughnut',
        data: {
          labels: ['Data at Risk due to Inactivity', 'Time-Limited Usage Window'],
          datasets: [{
            label: 'Risk Profile',
            data: [60, 40],
            backgroundColor: [redShades.risk, redShades.background],
            borderColor: '#ffffff',
            borderWidth: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { title: tooltipTitleCallback } }
          },
          cutout: '60%'
        }
      });
      // Rollover Benefit Chart
      new window.Chart(document.getElementById('rolloverBenefitChart'), {
        type: 'doughnut',
        data: {
          labels: ['Secure Data Bank', 'Continuous Rollover'],
          datasets: [{
            label: 'Benefit Profile',
            data: [85, 15],
            backgroundColor: [greenShades.safe, greenShades.background],
            borderColor: '#ffffff',
            borderWidth: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { title: tooltipTitleCallback } }
          },
          cutout: '60%'
        }
      });
      // Initial Cost Chart
      new window.Chart(document.getElementById('initialCostChart'), {
        type: 'bar',
        data: {
          labels: [processLabel('Mobile Planning (20GB/365d)'), processLabel('y.u mobile (with Entry Pkg)')],
          datasets: [{
            label: 'Initial Cost (JPY)',
            data: [5150, 940],
            backgroundColor: [brilliantBlues.lightBlue, brilliantBlues.darkBlue],
            borderColor: [brilliantBlues.lightBlue, brilliantBlues.darkBlue],
            borderWidth: 1,
            barThickness: 50,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { title: tooltipTitleCallback } }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Cost (JPY)' }
            }
          }
        }
      });
      // Top Up Cost Chart
      new window.Chart(document.getElementById('topUpCostChart'), {
        type: 'bar',
        data: {
          labels: ['Mobile Planning', 'y.u mobile'],
          datasets: [{
            label: 'Cost for 10GB Top-Up (JPY)',
            data: [2480, 1200],
            backgroundColor: [brilliantBlues.lightBlue, brilliantBlues.darkBlue],
            borderColor: [brilliantBlues.lightBlue, brilliantBlues.darkBlue],
            borderWidth: 1,
            barThickness: 50,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { title: tooltipTitleCallback } }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Cost (JPY)' }
            }
          }
        }
      });
    };
    document.body.appendChild(script);
    // Set creation date
    const el = document.getElementById("creationDate");
    if (el) {
      el.textContent = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans text-gray-800">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-primary mb-2">The Quest for the Non-Expiring Data SIM</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">You want a data-only SIM for your laptop in Japan. You're a resident, want to prepay for data, and never want it to expire. Here's the reality and your best solution.</p>
      </header>
      <main className="space-y-12">
        <section id="market-reality" className="bg-background rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-6">The Market Problem: Expiration is the Standard</h2>
          <p className="text-center max-w-4xl mx-auto mb-8 text-muted-foreground">The Japanese prepaid market is built for tourists, not residents with sporadic data needs. Virtually all "prepaid" data comes with a strict, short expiration date. True "non-expiring" data buckets that you can buy and use forever don't exist. But there are smarter alternatives.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="border-2 border-red-300 bg-red-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-red-700">Tourist SIMs</h3>
              <p className="text-4xl font-black text-red-600 my-2">7-30</p>
              <p className="font-semibold text-red-700">Days Validity</p>
              <p className="text-sm text-red-500 mt-2">Data is forfeited after the period ends. Inefficient and costly for long-term use.</p>
            </div>
            <div className="border-2 border-yellow-400 bg-yellow-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-yellow-800">Long-Validity Prepaid</h3>
              <p className="text-4xl font-black text-yellow-700 my-2">180-365</p>
              <p className="font-semibold text-yellow-800">Days Validity</p>
              <p className="text-sm text-yellow-600 mt-2">A better option, but carries a hidden risk of deactivation if you don't use it regularly.</p>
            </div>
            <div className="border-2 border-green-400 bg-green-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-green-800">Permanent Rollover Plan</h3>
              <p className="text-4xl font-black text-green-700 my-2">∞</p>
              <p className="font-semibold text-green-800">Effective Validity</p>
              <p className="text-sm text-green-600 mt-2">A unique monthly plan where data never expires, creating a "data bank" you can use anytime.</p>
            </div>
          </div>
        </section>
        <section id="solution-paths" className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Your Two Smartest Choices</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">Your resident status unlocks two powerful solutions that get you closest to your goal. Let's compare the "Prepaid Bucket" vs. the "Permanent Rollover" model.</p>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <article className="bg-background rounded-2xl shadow-lg p-6 md:p-8 h-full">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">Path 1: The Prepaid Bucket</h3>
            <p className="font-semibold text-muted-foreground mb-4">Provider Example: Mobile Planning</p>
            <p className="mb-6 text-gray-700">This model lets you buy a large data bucket (e.g., 20GB) with a long validity period (e.g., 365 days). It feels like a true one-time purchase, but it has one critical, hidden flaw.</p>
            <div className="chart-container mx-auto" style={{ position: 'relative', width: '100%', maxWidth: 600, height: 320, maxHeight: 400 }}>
              <canvas id="prepaidRiskChart"></canvas>
            </div>
            <p className="text-center mt-4 text-gray-700 font-semibold">The biggest issue is a hidden deactivation clause: if the SIM isn't used for 60 days, it's suspended and you lose all your data.</p>
          </article>
          <article className="bg-background rounded-2xl shadow-lg p-6 md:p-8 h-full">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">Path 2: The Permanent Rollover</h3>
            <p className="font-semibold text-muted-foreground mb-4">Provider Example: y.u mobile</p>
            <p className="mb-6 text-gray-700">This is a unique low-cost monthly plan. All unused data—both your monthly 5GB and any top-ups—rolls over forever, building a data bank up to 100GB. It's the ultimate in data preservation.</p>
            <div className="chart-container mx-auto" style={{ position: 'relative', width: '100%', maxWidth: 600, height: 320, maxHeight: 400 }}>
              <canvas id="rolloverBenefitChart"></canvas>
            </div>
            <p className="text-center mt-4 text-gray-700 font-semibold">With a low monthly fee, you get complete immunity from data loss due to time or inactivity. Your data is always safe.</p>
          </article>
        </div>
        <section id="head-to-head" className="bg-background rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">Head-to-Head: A Quantitative Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-center text-blue-700 mb-2">Initial Cost to Get Started</h4>
              <p className="text-sm text-center mb-4 text-muted-foreground">Comparing a 20GB/365-day prepaid SIM vs. y.u mobile's sign-up with an entry package.</p>
              <div className="chart-container" style={{ position: 'relative', width: '100%', maxWidth: 600, height: 320, maxHeight: 400 }}>
                <canvas id="initialCostChart"></canvas>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-center text-blue-700 mb-2">Cost to Add 10GB of Data</h4>
              <p className="text-sm text-center mb-4 text-muted-foreground">Comparing the price of top-up data between the two models.</p>
              <div className="chart-container" style={{ position: 'relative', width: '100%', maxWidth: 600, height: 320, maxHeight: 400 }}>
                <canvas id="topUpCostChart"></canvas>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <h4 className="text-xl font-bold text-center text-blue-700 mb-4">The Critical Risk Factor: The 60-Day Inactivity Clause</h4>
            <p className="text-sm text-center mb-6 text-muted-foreground max-w-3xl mx-auto">This is the most important difference. The prepaid model punishes sporadic use, while the rollover model protects it. This flow chart shows what happens if you don't use your laptop for over two months.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-red-300 bg-red-50 p-6 rounded-xl">
                <h5 className="font-bold text-lg text-red-700 text-center mb-4">Prepaid Model (e.g., Mobile Planning)</h5>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full bg-red-100 p-3 rounded-lg text-center font-semibold">Laptop Not Used</div>
                  <div className="font-bold text-red-600 text-2xl">▼</div>
                  <div className="w-full bg-red-100 p-3 rounded-lg text-center font-semibold">60 Days Pass</div>
                  <div className="font-bold text-red-600 text-2xl">▼</div>
                  <div className="w-full bg-red-200 p-3 rounded-lg text-center font-bold text-red-800">Service Suspended 🔴</div>
                  <div className="w-full bg-red-200 p-3 rounded-lg text-center font-bold text-red-800">All Data Forfeited</div>
                </div>
              </div>
              <div className="border-2 border-green-400 bg-green-50 p-6 rounded-xl">
                <h5 className="font-bold text-lg text-green-800 text-center mb-4">Permanent Rollover (y.u mobile)</h5>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full bg-green-100 p-3 rounded-lg text-center font-semibold">Laptop Not Used</div>
                  <div className="font-bold text-green-600 text-2xl">▼</div>
                  <div className="w-full bg-green-100 p-3 rounded-lg text-center font-semibold">60 Days Pass</div>
                  <div className="font-bold text-green-600 text-2xl">▼</div>
                  <div className="w-full bg-green-200 p-3 rounded-lg text-center font-bold text-green-800">Nothing Happens ✅</div>
                  <div className="w-full bg-green-200 p-3 rounded-lg text-center font-bold text-green-800">Data is Safe & Growing</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="verdict" className="bg-gradient-to-br from-primary to-blue-400 text-white rounded-2xl shadow-2xl p-6 md:p-10">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">The Verdict: Data Insurance is the Smartest Play</h2>
          <p className="text-center max-w-4xl mx-auto mb-8 text-indigo-100">While the prepaid model's one-time cost is tempting, the risk of losing everything makes it a poor choice for truly infrequent use. The y.u mobile plan's small monthly fee is best viewed as a <b>data insurance premium</b>. It guarantees your data is always there when you need it.</p>
          <div className="bg-white/20 p-6 rounded-xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center">🏆 Optimal Solution: y.u mobile "Single Plan"</h3>
            <p className="text-center mt-2 text-indigo-100">For a recurring ¥800/month, you get 5GB of data that rolls over forever, building a secure data bank. This is the most robust, risk-free, and financially sound solution for long-term residents.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl max-w-4xl mx-auto mt-6">
            <h3 className="text-2xl font-bold text-center">🥈 Alternative: Mobile Planning 365-Day SIM</h3>
            <p className="text-center mt-2 text-indigo-100">If you are strictly against any monthly fee and are confident you will use the data at least once every 60 days, this is your best prepaid option. You must actively manage it to avoid data loss.</p>
          </div>
        </section>
        <section id="how-to-start">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">How to Get Started: Implementation Guide</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-background rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">🏆 For y.u mobile (Recommended)</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">1</span>
                  <div><span className="font-bold">Buy an Entry Package.</span> Search "y.u mobile エントリーパッケージ" on Rakuten or Yahoo. This ~¥500 package waives the ¥3,300 sign-up fee.</div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">2</span>
                  <div><span className="font-bold">Sign Up Online.</span> Visit the y.u mobile site, choose the "Single Plan" (data-only), and enter your package code.</div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">3</span>
                  <div><span className="font-bold">Provide ID.</span> You'll need your Residence Card and a Japanese credit card for the monthly payments.</div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">4</span>
                  <div><span className="font-bold">Activate.</span> Insert the SIM when it arrives and follow the simple activation instructions.</div>
                </li>
              </ol>
            </div>
            <div className="bg-background rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">🥈 For Mobile Planning (Alternative)</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">1</span>
                  <div><span className="font-bold">Purchase Online.</span> Visit a site like prepay-sim.com and choose a long-validity plan (e.g., 20GB/365 days).</div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">2</span>
                  <div><span className="font-bold">Configure APN.</span> When the SIM arrives, you must manually enter the APN settings into your laptop's network/cellular configuration. Instructions will be included.</div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">3</span>
                  <div><span className="font-bold">Test Connection.</span> Save the APN profile, select it, and ensure your internet is working.</div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold mr-4">4</span>
                  <div><span className="font-bold">Manage Proactively.</span> <span className="font-bold text-red-600">Crucial:</span> Use the SIM at least once every 60 days to prevent deactivation. Top up before data or time expires.</div>
                </li>
              </ol>
            </div>
          </div>
        </section>
      </main>
      <footer className="text-center mt-12 text-muted-foreground text-sm">
        <p>Data sourced from the Analytical Report on Long-Term, Data-Only SIM Solutions for Residents in Japan. All prices are approximate and subject to change. This infographic is for informational purposes only. Infographic created on <span id="creationDate"></span>.</p>
      </footer>
    </div>
  );
}
