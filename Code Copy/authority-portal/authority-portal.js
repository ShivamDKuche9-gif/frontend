/**
 * NLAMS: Apex Government Authority & Supervisory Analytics Engine
 * Connects directly with PIA and Field Officer Stores in localStorage
 */

(function () {
  'use strict';

  // Shared Data Sources
  const OFFICER_STORE_KEY = 'NLAMS_SHARED_ACQUISITION_STORE';
  const PIA_STORE_KEY = 'NLAMS_PIA_STATE';

  // National Baseline Dataset
  const NATIONAL_DATASET = {
    totalProjects: 3428,
    landProposedHa: 148250,
    landAcquiredHa: 109705,
    compAwardedCr: 142850,
    compDisbursedCr: 118565,
    escrowTrappedCr: 24285,
    affectedFamilies: 462800,
    rehabFamilies: 384120,
    delayedProjects: 611,
    stayOrders: 2120,
    forestClearancePct: 38.5,
    states: [
      { name: "Maharashtra", projects: 412, proposedHa: 24500, acquiredHa: 19110, compPaidCr: 24100, rate: "78%", lead: "Shri Rajesh Kumar (Principal Secy)" },
      { name: "Uttar Pradesh", projects: 480, proposedHa: 28200, acquiredHa: 22560, compPaidCr: 21800, rate: "80%", lead: "Shri Manoj Kumar Singh (ACS Revenue)" },
      { name: "Gujarat", projects: 265, proposedHa: 16800, acquiredHa: 13776, compPaidCr: 15200, rate: "82%", lead: "Dr. Jayanti Ravi (ACS Revenue)" },
      { name: "Madhya Pradesh", projects: 310, proposedHa: 18500, acquiredHa: 14060, compPaidCr: 9850, rate: "76%", lead: "Shri Nikunj Srivastava (Principal Secy)" },
      { name: "Tamil Nadu", projects: 290, proposedHa: 14300, acquiredHa: 10296, compPaidCr: 13450, rate: "72%", lead: "Dr. K. Manivasan (Principal Secy)" }
    ],
    districtsUP: [
      { name: "Varanasi", projects: 18, proposedHa: 1240.0, acquiredHa: 892.4, compPaidCr: 642.50, rate: "71.9%", collector: "Shri S. Rajalingam, IAS (DM)" },
      { name: "Chandauli", projects: 14, proposedHa: 980.5, acquiredHa: 810.0, compPaidCr: 480.20, rate: "82.6%", collector: "Shri Nikhil Tikaram, IAS (DM)" },
      { name: "Mirzapur", projects: 12, proposedHa: 840.0, acquiredHa: 612.0, compPaidCr: 395.00, rate: "72.8%", collector: "Ms. Priyanka Niranjan, IAS (DM)" }
    ]
  };

  // Active Supervisory Session
  let activeScope = 'NATIONAL'; // 'NATIONAL' | 'STATE' | 'DISTRICT'

  // Toast Helper
  function showToast(msg) {
    const box = document.getElementById('authToastBox');
    const toast = document.createElement('div');
    toast.className = 'auth-toast';
    toast.innerText = msg;
    box.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => box.removeChild(toast), 300);
    }, 3200);
  }

  // Navigation Controller
  function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-link-btn');
    const panes = document.querySelectorAll('.module-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMod = btn.dataset.mod;
        navigateTo(targetMod);
      });
    });

    // Mobile Drawer Toggle
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('authSidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  function navigateTo(modId) {
    document.querySelectorAll('.nav-link-btn').forEach(b => b.classList.toggle('active', b.dataset.mod === modId));
    document.querySelectorAll('.module-pane').forEach(p => p.classList.toggle('active', p.id === modId));

    const sidebar = document.getElementById('authSidebar');
    if (sidebar) sidebar.classList.remove('open');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Jurisdiction Scoping Controller
  function setupJurisdictionSwitcher() {
    const switcher = document.getElementById('jurisdictionSwitcher');
    if (!switcher) return;

    // Detect initial credential role from login.html
    const session = JSON.parse(sessionStorage.getItem('NLAMS_AUTH_SESSION'));
    if (session) {
      if (session.role === 'STATE_GOV_AUTHORITY') {
        switcher.value = 'STATE';
      } else if (session.role === 'DISTRICT_COLLECTOR') {
        switcher.value = 'DISTRICT';
      }
    }

    switcher.addEventListener('change', (e) => {
      setScope(e.target.value);
    });

    setScope(switcher.value);
  }

  function setScope(scope) {
    activeScope = scope;
    const nameDisplay = document.getElementById('scopeNameDisplay');
    const covDisplay = document.getElementById('scopeCoverageDisplay');
    const breadcrumb = document.getElementById('currentBreadcrumb');

    if (scope === 'NATIONAL') {
      nameDisplay.innerText = "National Apex (Central DoLR)";
      covDisplay.innerText = "Pan-India • 34 States/UTs • 684 Districts";
      breadcrumb.innerText = "National Apex Oversight Console";
      renderMetrics(NATIONAL_DATASET.totalProjects, NATIONAL_DATASET.landAcquiredHa, "₹ 1,18,565 Cr", "82.4% Probability");
    } else if (scope === 'STATE') {
      nameDisplay.innerText = "State Revenue Secretariat (UP)";
      covDisplay.innerText = "Statewide • 75 Districts • 480 Active Packages";
      breadcrumb.innerText = "State Authority Dashboard (Uttar Pradesh)";
      renderMetrics(480, 22560, "₹ 21,800 Cr", "84.2% Probability");
    } else {
      nameDisplay.innerText = "District Collectorate (Varanasi)";
      covDisplay.innerText = "District Jurisdiction • 3 Tehsils • 18 Corridor Packages";
      breadcrumb.innerText = "District Magistrate Executive Console (Varanasi)";
      renderMetrics(18, 892.4, "₹ 642.5 Cr", "88.6% Probability");
    }

    renderDrilldownTable();
    showToast(`Supervisory jurisdiction scoped to: ${nameDisplay.innerText}`);
  }

  function renderMetrics(projects, acquiredHa, compPaid, aiScore) {
    document.getElementById('qTotalProjects').innerText = `${projects} Projects`;
    document.getElementById('qLandAcquired').innerText = `${acquiredHa.toLocaleString()} Ha`;
    document.getElementById('qCompPaid').innerText = compPaid;
    document.getElementById('qAiSuccessScore').innerText = aiScore;
  }

  // Pure SVG Charts Engine (Zero Dependencies, Runs Offline)
  function renderSvgCharts() {
    // 1. Target vs Actual Multi-Bar Chart
    const targetSvg = document.getElementById('chartTargetActualSvg');
    if (targetSvg) {
      targetSvg.innerHTML = `
        <!-- Axis Gridlines -->
        <line x1="40" y1="180" x2="520" y2="180" stroke="#cbd5e1" stroke-width="1.5"/>
        <line x1="40" y1="130" x2="520" y2="130" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="40" y1="80" x2="520" y2="80" stroke="#f1f5f9" stroke-width="1"/>
        <line x1="40" y1="30" x2="520" y2="30" stroke="#f1f5f9" stroke-width="1"/>

        <!-- Y Axis Labels -->
        <text x="32" y="184" fill="#64748b" font-size="10" text-anchor="end">0</text>
        <text x="32" y="134" fill="#64748b" font-size="10" text-anchor="end">15k</text>
        <text x="32" y="84" fill="#64748b" font-size="10" text-anchor="end">30k</text>
        <text x="32" y="34" fill="#64748b" font-size="10" text-anchor="end">45k</text>

        <!-- Bars: Q1, Q2, Q3, Q4 -->
        <!-- Q1 -->
        <rect x="70" y="60" width="30" height="120" fill="#0284c7" rx="3"/>
        <rect x="105" y="75" width="30" height="105" fill="#059669" rx="3"/>
        <text x="102" y="200" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">Q1 (Apr-Jun)</text>

        <!-- Q2 -->
        <rect x="180" y="45" width="30" height="135" fill="#0284c7" rx="3"/>
        <rect x="215" y="62" width="30" height="118" fill="#059669" rx="3"/>
        <text x="212" y="200" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">Q2 (Jul-Sep)</text>

        <!-- Q3 -->
        <rect x="290" y="35" width="30" height="145" fill="#0284c7" rx="3"/>
        <rect x="325" y="55" width="30" height="125" fill="#059669" rx="3"/>
        <text x="322" y="200" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">Q3 (Oct-Dec)</text>

        <!-- Q4 -->
        <rect x="400" y="25" width="30" height="155" fill="#0284c7" rx="3"/>
        <rect x="435" y="48" width="30" height="132" fill="#059669" rx="3"/>
        <text x="432" y="200" fill="#334155" font-size="11" font-weight="700" text-anchor="middle">Q4 (Jan-Mar)</text>
      `;
    }

    // 2. Fund Flow Waterfall Chart
    const waterfallSvg = document.getElementById('chartFundWaterfallSvg');
    if (waterfallSvg) {
      waterfallSvg.innerHTML = `
        <line x1="40" y1="180" x2="520" y2="180" stroke="#cbd5e1" stroke-width="1.5"/>
        
        <!-- Step 1: Demand Raised -->
        <rect x="60" y="30" width="60" height="150" fill="#0f172a" rx="4"/>
        <text x="90" y="25" fill="#0f172a" font-size="10" font-weight="800" text-anchor="middle">₹142.8k Cr</text>
        <text x="90" y="200" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">1. Demand</text>

        <!-- Step 2: Released to Escrow -->
        <rect x="180" y="55" width="60" height="125" fill="#0284c7" rx="4"/>
        <text x="210" y="50" fill="#0284c7" font-size="10" font-weight="800" text-anchor="middle">₹128.5k Cr</text>
        <text x="210" y="200" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">2. Escrow</text>

        <!-- Step 3: DBT Disbursed -->
        <rect x="300" y="70" width="60" height="110" fill="#059669" rx="4"/>
        <text x="330" y="65" fill="#059669" font-size="10" font-weight="800" text-anchor="middle">₹118.5k Cr</text>
        <text x="330" y="200" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">3. Disbursed</text>

        <!-- Step 4: Trapped Capital -->
        <rect x="420" y="152" width="60" height="28" fill="#e11d48" rx="4"/>
        <text x="450" y="146" fill="#e11d48" font-size="10" font-weight="800" text-anchor="middle">₹24.2k Cr</text>
        <text x="450" y="200" fill="#e11d48" font-size="10" font-weight="700" text-anchor="middle">4. Trapped</text>
      `;
    }
  }

  // Hierarchical Drilldown Renderer
  function renderDrilldownTable() {
    const tableHead = document.getElementById('drillTableHead');
    const tableBody = document.getElementById('drillTableBody');
    const tableHeading = document.getElementById('drillTableHeading');

    if (activeScope === 'NATIONAL') {
      tableHeading.innerText = "National State-wise Performance Breakdown (Click state to drill down)";
      tableHead.innerHTML = `
        <tr>
          <th>State / UT</th>
          <th>Lead Revenue Official</th>
          <th>Active Packages</th>
          <th>Land Proposed (Ha)</th>
          <th>Possession Taken</th>
          <th>Acquisition Velocity</th>
        </tr>
      `;
      tableBody.innerHTML = NATIONAL_DATASET.states.map(s => `
        <tr class="clickable-row" onclick="window.authApp.drillIntoState('${s.name}')">
          <td><strong>${s.name}</strong> &rarr;</td>
          <td>${s.lead}</td>
          <td>${s.projects}</td>
          <td>${s.proposedHa.toLocaleString()} Ha</td>
          <td>${s.acquiredHa.toLocaleString()} Ha</td>
          <td><span class="badge-tag green">${s.rate} Rate</span></td>
        </tr>
      `).join('');
    } else {
      tableHeading.innerText = "District-wise Execution Breakdown (Uttar Pradesh Corridors)";
      tableHead.innerHTML = `
        <tr>
          <th>District Jurisdiction</th>
          <th>District Collector / DM</th>
          <th>Packages</th>
          <th>Proposed (Ha)</th>
          <th>Possessed (Ha)</th>
          <th>Disbursement Progress</th>
        </tr>
      `;
      tableBody.innerHTML = NATIONAL_DATASET.districtsUP.map(d => `
        <tr class="clickable-row" onclick="window.authApp.drillIntoDistrict('${d.name}')">
          <td><strong>${d.name}</strong> &rarr;</td>
          <td>${d.collector}</td>
          <td>${d.projects}</td>
          <td>${d.proposedHa.toFixed(1)} Ha</td>
          <td>${d.acquiredHa.toFixed(1)} Ha</td>
          <td><span class="badge-tag cyan">${d.rate}</span></td>
        </tr>
      `).join('');
    }
  }

  // GIS Inspector Hover
  function setupGisInspector() {
    const polys = document.querySelectorAll('.cadastral-poly');
    const bar = document.getElementById('gisInspectorBar');

    polys.forEach(poly => {
      poly.addEventListener('mouseenter', () => {
        bar.innerHTML = `<strong>Active Cadastral Plot:</strong> ${poly.dataset.info}`;
        bar.style.borderColor = '#d97706';
      });
      poly.addEventListener('mouseleave', () => {
        bar.innerText = "Hover over any cadastral parcel polygon above to inspect spatial title records.";
        bar.style.borderColor = '';
      });
    });
  }

  // Alerts Feed Generator
  function renderAlertsFeed() {
    const feed = document.getElementById('alertsFeedStack');
    feed.innerHTML = `
      <div class="bottleneck-item critical" style="margin-bottom:12px;">
        <div class="b-left">
          <span class="priority-pill red">STATUTORY LAPSING ALERT (SECTION 25)</span>
          <h4>Package IV &bull; Chandauli &amp; Varanasi Corridor</h4>
          <p>Section 19 Declaration published 310 days ago. 55 days remaining before statutory lapsing.</p>
        </div>
        <button class="btn btn-primary" onclick="alert('Directive dispatched to District Magistrate.')">Remind Collector</button>
      </div>
      <div class="bottleneck-item high">
        <div class="b-left">
          <span class="priority-pill amber">REJECTION AUDIT BROADCAST</span>
          <h4>Field Officer Rejection Action Received</h4>
          <p>Special Land Acquisition Officer (SLAO) marked Khasra 49 as sub-judice under Section 64 reference.</p>
        </div>
        <button class="btn btn-secondary" onclick="alert('Inspection dossier opened.')">Review Finding</button>
      </div>
    `;
  }

  // Audit Trail Renderer
  function renderAuditTrail() {
    const tbody = document.getElementById('apexAuditTrailTable');
    tbody.innerHTML = `
      <tr>
        <td class="font-mono">Today, 10:30:15</td>
        <td><strong>Secretary (DoLR)</strong></td>
        <td>Central Apex</td>
        <td>Quarterly Fund Utilization Reviewed (&#8377;1,18,565 Cr)</td>
        <td><code>0x8f2d...c914</code></td>
      </tr>
      <tr>
        <td class="font-mono">Yesterday, 16:40:22</td>
        <td><strong>Joint Secy (Infrastructure)</strong></td>
        <td>National Corridor</td>
        <td>Escalation Notice Dispatched on Section 25 Lapsing Threat</td>
        <td><code>0x4b71...a302</code></td>
      </tr>
      <tr>
        <td class="font-mono">22-Jan-2025 11:15:00</td>
        <td><strong>SLAO (Varanasi)</strong></td>
        <td>District UP</td>
        <td>Field Scrutiny Verified for Package IV Requisition</td>
        <td><code>0x9e12...77fe</code></td>
      </tr>
    `;
  }

  // CSV Exporters
  function setupCsvExporters() {
    window.authApp = {
      navigateTo,
      drillIntoState: function (stateName) {
        document.getElementById('jurisdictionSwitcher').value = 'STATE';
        setScope('STATE');
      },
      drillIntoDistrict: function (distName) {
        document.getElementById('jurisdictionSwitcher').value = 'DISTRICT';
        setScope('DISTRICT');
      },
      exportMasterCsv: function () {
        let csv = "State_UT,Lead_Official,Projects,Proposed_Ha,Acquired_Ha,Comp_Paid_Cr,Rate\n";
        NATIONAL_DATASET.states.forEach(s => {
          csv += `"${s.name}","${s.lead}",${s.projects},${s.proposedHa},${s.acquiredHa},${s.compPaidCr},"${s.rate}"\n`;
        });
        downloadBlob(csv, "NLAMS_Apex_National_Acquisition_Schedule.csv");
      },
      exportEscrowCsv: function () {
        const csv = "Escrow_Category,Trapped_Capital_Cr,Percentage,Remedial_Action\n" +
                    "Title Disputes & Sub-Judice,14570,60%,Special Lok Adalat Benches\n" +
                    "Missing KYC & Legal Heir Claims,6071,25%,Aadhaar-Seeded Village Verification Camps\n" +
                    "Administrative Treasury Release Lag,3644,15%,State Finance Sanction Waiver\n";
        downloadBlob(csv, "NLAMS_Apex_Escrow_Litigation_Audit.csv");
      },
      exportExecutiveDossier: function () {
        this.exportMasterCsv();
      }
    };
  }

  function downloadBlob(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Generated & Exported: ${filename}`);
  }

  // Boot Engine
  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupCsvExporters();
    setupJurisdictionSwitcher();
    renderSvgCharts();
    setupGisInspector();
    renderAlertsFeed();
    renderAuditTrail();

    // Clock
    setInterval(() => {
      const now = new Date();
      const clock = document.getElementById('liveClockDisplay');
      if (clock) clock.innerText = `IST ${now.toLocaleTimeString()}`;
    }, 1000);
  });
})();