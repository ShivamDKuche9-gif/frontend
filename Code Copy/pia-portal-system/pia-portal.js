/**
 * National Land Acquisition & Management System (NLAMS)
 * Project Implementing Agency (PIA) Portal Engine
 */

(function () {
  'use strict';

  // Master State Schema (Persists to localStorage)
  const defaultState = {
    agency: {
      code: "NHAI",
      name: "NHAI - PIU Varanasi",
      type: "National Highway Authority",
      officer: "Chief General Manager (Technical)",
      email: "piu.varanasi@nhai.org"
    },
    currentProjectId: "NHAI-LA-2025-UP04-0982",
    projects: [
      {
        id: "NHAI-LA-2025-UP04-0982",
        name: "6-Lane Varanasi-Ranchi-Kolkata Economic Corridor (Package IV)",
        type: "National Highway",
        state: "Uttar Pradesh",
        district: "Varanasi / Chandauli",
        chainage: "KM 120+000 to KM 184+500",
        costCr: 3450.00,
        landReqHa: 385.500,
        timelineMos: 36,
        pafs: 620,
        stage: "District Verification",
        stageClass: "stage-district"
      },
      {
        id: "NHAI-LA-2024-MH02-0144",
        name: "Vadodara-Mumbai Expressway Spur Link (JNPA Port Connector)",
        type: "National Highway",
        state: "Maharashtra",
        district: "Raigad",
        chainage: "KM 0+000 to KM 42+000",
        costCr: 2180.00,
        landReqHa: 240.200,
        timelineMos: 28,
        pafs: 410,
        stage: "Approved",
        stageClass: "stage-approved"
      }
    ],
    landSchedules: [
      { village: "Rampur Kalan", khasra: "42/1, 43, 48", extentHa: 18.420, tenure: "Private Agriculture", status: "Sec 11 Notified" },
      { village: "Mehrauli Khurd", khasra: "104, 105/2, 108", extentHa: 12.150, tenure: "Private Agriculture", status: "JMS Verified" },
      { village: "Sultanpur Khalsa", khasra: "14, 16/1", extentHa: 6.800, tenure: "Government Revenue", status: "Transferred" }
    ],
    documents: [
      { title: "Varanasi_Pkg4_JMS_Cadastral_Dossier.pdf", cat: "JMS Cadastral Survey", ver: "v1.2", hash: "0x8f2d...c914", date: "18-Jan-2025" },
      { title: "Detailed_Project_Report_DPR_Feasibility.pdf", cat: "Detailed Project Report (DPR)", ver: "v2.0", hash: "0x4b71...a302", date: "10-Jan-2025" },
      { title: "Section_11_Gazette_Preliminary_Draft.pdf", cat: "Section 11 Draft", ver: "v1.0", hash: "0x9e12...77fe", date: "22-Jan-2025" }
    ],
    notifications: [
      { id: 1, title: "Section 25 Statutory Lapsing Alert", desc: "45 days remaining for Section 19 declaration to Section 23 award inquiry in Package IV.", time: "10m ago", urgent: true },
      { id: 2, title: "JMS Verification Completed", desc: "Tehsildar signed off on 14 Khasra plots in Rampur Kalan.", time: "2h ago", urgent: false },
      { id: 3, title: "Escrow Deposit Confirmed", desc: "Ministry released ₹44.00 Cr into District Collector Escrow Account via PFMS.", time: "1d ago", urgent: false }
    ]
  };

  // Load from Storage or Initialize
  let state = JSON.parse(localStorage.getItem('NLAMS_PIA_STATE')) || defaultState;

  function saveState() {
    localStorage.setItem('NLAMS_PIA_STATE', JSON.stringify(state));
  }

  // Toast Dispatcher
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => container.removeChild(toast), 300);
    }, 3200);
  }

  // Tab Navigation Engine
  function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item-btn');
    const panes = document.querySelectorAll('.module-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetModule = btn.dataset.module;
        navigateTo(targetModule);
      });
    });

    // Mobile Sidebar Toggle
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('piaSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  }

  function navigateTo(moduleId) {
    const navButtons = document.querySelectorAll('.nav-item-btn');
    const panes = document.querySelectorAll('.module-pane');

    navButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.module === moduleId);
    });

    panes.forEach(p => {
      p.classList.toggle('active', p.id === moduleId);
    });

    // Auto-close mobile drawer
    const sidebar = document.getElementById('piaSidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Agency Identity Switcher
  function setupAgencySwitcher() {
    const select = document.getElementById('agencySwitcher');
    if (!select) return;

    select.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'NHAI') {
        state.agency = {
          code: "NHAI",
          name: "NHAI - PIU Varanasi",
          type: "National Highway Authority",
          officer: "Chief General Manager (Technical)",
          email: "piu.varanasi@nhai.org"
        };
      } else if (val === 'DFCCIL') {
        state.agency = {
          code: "DFCC",
          name: "DFCCIL - Eastern Corridor Unit",
          type: "Dedicated Freight Rail Authority",
          officer: "General Manager (Coordination)",
          email: "gm.eastern@dfccil.in"
        };
      } else {
        state.agency = {
          code: "SIDC",
          name: "UPSIDC - Industrial Infrastructure",
          type: "State Development Corporation",
          officer: "Superintending Engineer",
          email: "projects@upsidc.gov.in"
        };
      }
      saveState();
      renderAll();
      showToast(`Switched active agency persona to ${state.agency.name}`, 'info');
    });
  }

  // Render Functions
  function renderDashboard() {
    // Agency Header display
    document.getElementById('agencyBadgeCode').innerText = state.agency.code;
    document.getElementById('agencyNameDisplay').innerText = state.agency.name;
    document.getElementById('agencyTypeDisplay').innerText = state.agency.type;

    // Total Projects Counter
    document.getElementById('dashTotalProjects').innerText = `${state.projects.length} Projects`;

    // Pending Actions
    const actionList = document.getElementById('dashPendingActionsList');
    actionList.innerHTML = state.notifications.map(n => `
      <li class="alert-item ${n.urgent ? 'urgent' : ''}">
        <div>
          <strong>${n.title}</strong>
          <span>${n.desc}</span>
        </div>
        <span class="font-mono text-cyan" style="font-size:0.75rem;">${n.time}</span>
      </li>
    `).join('');

    // Recent Requisitions Table
    const recentTable = document.getElementById('dashRecentAppsTable');
    recentTable.innerHTML = state.projects.map(p => `
      <tr>
        <td>
          <strong>${p.id}</strong>
          <div style="font-size:0.75rem; color:#64748b;">${p.name.substring(0, 36)}...</div>
        </td>
        <td>${p.district}</td>
        <td>${p.landReqHa.toFixed(2)}</td>
        <td><span class="badge-stage ${p.stageClass}">${p.stage}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 10px; font-size:0.76rem;" onclick="window.piaApp.navigateTo('mod-progress')">
            Monitor
          </button>
        </td>
      </tr>
    `).join('');

    // Sync Dropdowns
    const landSelect = document.getElementById('landReqProjSelect');
    const fundSelect = document.getElementById('fundProjectSelect');
    const opts = state.projects.map(p => `<option value="${p.id}">${p.id} - ${p.name.substring(0, 32)}...</option>`).join('');
    if (landSelect) landSelect.innerHTML = opts;
    if (fundSelect) fundSelect.innerHTML = opts;

    // Notifications Count
    document.getElementById('notifCountBadge').innerText = state.notifications.length;
    document.getElementById('notifListContainer').innerHTML = state.notifications.map(n => `
      <div class="alert-item ${n.urgent ? 'urgent' : ''}" style="margin-bottom:12px;">
        <div>
          <strong>${n.title}</strong>
          <p style="margin:4px 0 0; color:#475569;">${n.desc}</p>
        </div>
        <span class="font-mono" style="font-size:0.75rem; color:#64748b;">${n.time}</span>
      </div>
    `).join('');
  }

  function renderLandSchedules() {
    const table = document.getElementById('landSchedulesTable');
    document.getElementById('landScheduleCount').innerText = `${state.landSchedules.length} Schedules Logged`;
    table.innerHTML = state.landSchedules.map(s => `
      <tr>
        <td><strong>${s.village}</strong></td>
        <td class="font-mono">${s.khasra}</td>
        <td>${s.extentHa.toFixed(3)}</td>
        <td>${s.tenure}</td>
        <td><span class="badge-stage stage-district">${s.status}</span></td>
      </tr>
    `).join('');
  }

  function renderDMS() {
    const table = document.getElementById('dmsTableBody');
    table.innerHTML = state.documents.map((d, index) => `
      <tr>
        <td><strong>${d.title}</strong></td>
        <td>${d.cat}</td>
        <td><span class="badge-stage stage-submitted">${d.ver}</span></td>
        <td><code style="color:#0284c7;">${d.hash}</code></td>
        <td>${d.date}</td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.74rem;" onclick="window.piaApp.deleteDoc(${index})">
            Remove
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Form Submission Handlers
  function setupForms() {
    // 1. Create Project Form
    const projForm = document.getElementById('formNewProject');
    projForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const newId = `${state.agency.code}-LA-2025-PKG-${codeSuffix}`;

      const newProj = {
        id: newId,
        name: document.getElementById('projName').value,
        type: document.getElementById('projType').value,
        state: document.getElementById('projState').value,
        district: document.getElementById('projDistrict').value,
        chainage: document.getElementById('projChainage').value,
        costCr: parseFloat(document.getElementById('projCost').value),
        landReqHa: parseFloat(document.getElementById('projLandReq').value),
        timelineMos: parseInt(document.getElementById('projTimeline').value),
        pafs: parseInt(document.getElementById('projPafs').value),
        stage: "Submitted",
        stageClass: "stage-submitted"
      };

      state.projects.unshift(newProj);
      saveState();
      renderAll();
      showToast(`Project Dossier ${newId} initialized successfully!`, 'success');
      projForm.reset();
      navigateTo('mod-land-request');
    });

    // 2. Land Schedule Form
    const landForm = document.getElementById('formLandRequest');
    landForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const schedule = {
        village: document.getElementById('landVillage').value,
        khasra: document.getElementById('landKhasra').value,
        extentHa: parseFloat(document.getElementById('landExtent').value),
        tenure: document.getElementById('landTenure').value,
        status: "Draft Submitted"
      };

      state.landSchedules.unshift(schedule);
      saveState();
      renderLandSchedules();
      showToast(`Parcel schedule for Khasra ${schedule.khasra} saved!`, 'success');
      landForm.reset();
    });

    // 3. Fund Request Live Sum Calculation
    const fundInputs = ['fundMarketVal', 'fundSolatium', 'fundRr', 'fundAdmin'];
    fundInputs.forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        const sum = fundInputs.reduce((acc, curr) => acc + (parseFloat(document.getElementById(curr).value) || 0), 0);
        document.getElementById('fundTotalDisplay').value = `₹ ${sum.toFixed(2)} Cr`;
      });
    });

    const fundForm = document.getElementById('formFundRequest');
    fundForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sum = fundInputs.reduce((acc, curr) => acc + (parseFloat(document.getElementById(curr).value) || 0), 0);
      showToast(`Fund requisition for ₹${sum.toFixed(2)} Cr transmitted to Ministry PFMS gateway!`, 'success');
      document.getElementById('finPending').innerText = `₹ ${sum.toFixed(2)} Cr`;
    });

    // 4. DMS Document Upload
    const docForm = document.getElementById('formDocUpload');
    docForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('docTitle').value;
      const cat = document.getElementById('docCategory').value;
      const ver = document.getElementById('docVersion').value;
      const hex = '0x' + Math.random().toString(16).substr(2, 8) + '...e4b2';

      state.documents.unshift({
        title,
        cat,
        ver,
        hash: hex,
        date: "Today, Just Now"
      });

      saveState();
      renderDMS();
      showToast(`Record ${title} vaulted with cryptographic hash ${hex}`, 'success');
      docForm.reset();
    });

    // 5. Pre-Submission Checklist & Formal Transmit
    const btnTransmit = document.getElementById('btnTransmitApplication');
    btnTransmit.addEventListener('click', () => {
      const chk1 = document.getElementById('chkSia').checked;
      const chk2 = document.getElementById('chkJms').checked;
      const chk3 = document.getElementById('chkEscrow').checked;
      const chk4 = document.getElementById('chkNoc').checked;

      if (!chk1 || !chk2 || !chk3 || !chk4) {
        showToast("Error: All statutory checklist criteria must be verified before transmission.", "info");
        return;
      }

      showToast("Transmitting Requisition Dossier to District Collector (CALA Varanasi)...", "success");
      setTimeout(() => {
        document.getElementById('appActionState').innerText = "CALA Hearing Scheduled (Section 15)";
        document.getElementById('appActionState').className = "badge-amber";
        showToast("Dossier transmitted! Status updated to Section 15 Hearing Scheduled.", "success");
      }, 1200);
    });
  }

  // CSV Report Generators
  function setupExportButtons() {
    const btnProject = document.getElementById('btnExportProjectCsv');
    if (btnProject) {
      btnProject.addEventListener('click', () => {
        let csv = "Project_ID,Project_Name,Category,State,District,Cost_Cr_INR,Land_Req_Ha,Stage\n";
        state.projects.forEach(p => {
          csv += `"${p.id}","${p.name}","${p.type}","${p.state}","${p.district}",${p.costCr},${p.landReqHa},"${p.stage}"\n`;
        });
        downloadCsvBlob(csv, `NLAMS_PIA_${state.agency.code}_Projects.csv`);
      });
    }

    const btnFund = document.getElementById('btnExportFundCsv');
    if (btnFund) {
      btnFund.addEventListener('click', () => {
        const csv = "Cost_Head,Sanctioned_Cr,Deposited_Collector_Escrow_Cr,Pending_Release_Cr\n" +
                    "Market Value First Schedule,70.00,55.00,15.00\n" +
                    "100% Statutory Solatium,70.00,55.00,15.00\n" +
                    "Second Schedule R&R Grants,34.00,22.00,12.00\n" +
                    "Administrative Contingency,10.00,8.00,2.00\n";
        downloadCsvBlob(csv, `NLAMS_PIA_${state.agency.code}_Fund_Ledger.csv`);
      });
    }
  }

  function downloadCsvBlob(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Generated and exported ${filename}`, 'info');
  }

  // Global delete handler
  window.piaApp = {
    navigateTo,
    deleteDoc: function (idx) {
      state.documents.splice(idx, 1);
      saveState();
      renderDMS();
      showToast("Document record removed from current requisition.", "info");
    }
  };

  function renderAll() {
    renderDashboard();
    renderLandSchedules();
    renderDMS();
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupAgencySwitcher();
    setupForms();
    setupExportButtons();
    renderAll();

    // Live Clock
    setInterval(() => {
      const now = new Date();
      const clock = document.getElementById('liveClock');
      if (clock) clock.innerText = `IST ${now.toLocaleTimeString()}`;
    }, 1000);
  });
})();


// Direct Exit to Home Portal Handler
    const exitBtn = document.getElementById('portalExitBtn');
    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '../index.html';  // Added ../
      });
    }