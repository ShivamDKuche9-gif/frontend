/**
 * National Land Acquisition & Management System (NLAMS)
 * Field & Land Verification Officer Portal Engine
 * SIH Problem Statement 26016
 */

(function () {
  'use strict';

  // Master Data Pipeline (Interconnected directly with PIA Portal)
  const STORAGE_KEY = 'NLAMS_SHARED_ACQUISITION_STORE';

  const initialRequisitions = [
    {
      appId: "NLAMS-REQ-2025-UP-9842",
      projId: "NHAI-LA-2025-UP04-0982",
      piaName: "NHAI - PIU Varanasi",
      alignment: "Varanasi-Kolkata Corridor (Pkg 4)",
      extentHa: 385.500,
      fundsCr: 642.50,
      status: "Under District Scrutiny",
      statusClass: "bs-review",
      khasraList: [
        { village: "Rampur Kalan", khasra: "42/1", areaClaimed: 3.42, rorArea: 3.42, rorOwner: "Suresh Ram & Ors", status: "Verified", statusClass: "bs-verified" },
        { village: "Rampur Kalan", khasra: "43", areaClaimed: 4.82, rorArea: 4.82, rorOwner: "Gram Sabha & Mandir Trust", status: "Verified", statusClass: "bs-verified" },
        { village: "Mehrauli", khasra: "49", areaClaimed: 6.25, rorArea: 5.90, rorOwner: "Disputed Title (Sub-Judice)", status: "Mismatch", statusClass: "bs-correct" }
      ],
      documents: [
        { title: "Joint_Measurement_Survey_Pkg4.pdf", cat: "JMS Cadastral Survey", ver: "v1.2", verified: true },
        { title: "DPR_Feasibility_Report.pdf", cat: "Detailed Project Report", ver: "v2.0", verified: true },
        { title: "Section_11_Draft_Gazette.pdf", cat: "Section 11 Draft", ver: "v1.0", verified: false }
      ],
      checklist: [
        { param: "Project Alignment & Requisition Feasibility", dept: "Revenue / SLAO", status: "Verified", notes: "Corridor chainage conforms with MoRTH mandate." },
        { param: "Cadastral Boundary Reconciliation", dept: "Surveyor / Amin", status: "Verified", notes: "31 parcels match digital Bhulekh coordinates." },
        { param: "Land Title & Ownership Records (RoR)", dept: "Tehsildar", status: "Verified", notes: "Khatauni verified. 1 dispute on Khasra 49." },
        { param: "Forest Clearance Stage-I In-Principle", dept: "Forest / MoEFCC", status: "Verified", notes: "14.2 Ha diversion application acknowledged." },
        { param: "Compensation Calculation (100% Solatium)", dept: "Collector / SLAO", status: "Pending", notes: "First Schedule circle rate multiplier under audit." },
        { param: "R&R Second Schedule Allotment", dept: "R&R Cell", status: "Verified", notes: "Resettlement site earmarked at Chandauli." }
      ],
      auditHistory: [
        { time: "22-Jan-2025 10:14", officer: "Shri V. P. Singh (Tehsildar)", action: "RoR Verification Completed", from: "Pending", to: "Under District Scrutiny" },
        { time: "22-Jan-2025 14:30", officer: "Shri Amit Verma (Surveyor)", action: "Field Visit Report Submitted", from: "Under Scrutiny", to: "Under District Scrutiny" }
      ]
    }
  ];

  // Initialize or read shared data store
  let activeData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialRequisitions;
  function persistStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeData));
  }

  // Determine Logged In Officer Role from login.html Session
  const sessionUser = JSON.parse(sessionStorage.getItem('NLAMS_AUTH_SESSION')) || {
    role: "DISTRICT_LAO",
    email: "lao.varanasi@up.gov.in"
  };

  // Toast Helper
  function showToast(msg) {
    const box = document.getElementById('officerToastBox');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerText = msg;
    box.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => box.removeChild(toast), 300);
    }, 3200);
  }

  // MapLibre GL Integration
  let mapInstance = null;

  function initMapLibreGIS() {
    if (mapInstance) return;
    const container = document.getElementById('maplibreCanvas');
    if (!container || !window.maplibregl) return;

    mapInstance = new maplibregl.Map({
      container: 'maplibreCanvas',
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [82.9739, 25.3176], // Varanasi / Chandauli Corridor
      zoom: 12
    });

    mapInstance.on('load', () => {
      // 1. Add Corridor Linear Buffer GeoJSON
      mapInstance.addSource('corridorSource', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [82.9500, 25.3050],
              [82.9739, 25.3176],
              [83.0100, 25.3350]
            ]
          }
        }
      });

      mapInstance.addLayer({
        id: 'corridorLayer',
        type: 'line',
        source: 'corridorSource',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#0284c7', 'line-width': 8, 'line-opacity': 0.6 }
      });

      // 2. Add Cadastral Khasra Parcels Polygon
      mapInstance.addSource('parcelsSource', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { khasra: '42/1', village: 'Rampur', status: 'Verified' },
              geometry: {
                type: 'Polygon',
                coordinates: [[[82.9700, 25.3150], [82.9750, 25.3150], [82.9740, 25.3180], [82.9690, 25.3180], [82.9700, 25.3150]]]
              }
            },
            {
              type: 'Feature',
              properties: { khasra: '43', village: 'Rampur', status: 'Verified' },
              geometry: {
                type: 'Polygon',
                coordinates: [[[82.9750, 25.3150], [82.9800, 25.3150], [82.9810, 25.3200], [82.9740, 25.3180], [82.9750, 25.3150]]]
              }
            },
            {
              type: 'Feature',
              properties: { khasra: '49', village: 'Mehrauli', status: 'Mismatch' },
              geometry: {
                type: 'Polygon',
                coordinates: [[[82.9800, 25.3150], [82.9850, 25.3150], [82.9860, 25.3220], [82.9810, 25.3200], [82.9800, 25.3150]]]
              }
            }
          ]
        }
      });

      mapInstance.addLayer({
        id: 'parcelsLayer',
        type: 'fill',
        source: 'parcelsSource',
        paint: {
          'fill-color': [
            'match', ['get', 'status'],
            'Verified', '#10b981',
            'Mismatch', '#e11d48',
            '#0284c7'
          ],
          'fill-opacity': 0.45
        }
      });

      mapInstance.addLayer({
        id: 'parcelsOutline',
        type: 'line',
        source: 'parcelsSource',
        paint: { 'line-color': '#0f172a', 'line-width': 1.5 }
      });
    });

    // Mismatch Detection Trigger
    const btnMismatch = document.getElementById('btnDetectMismatch');
    if (btnMismatch) {
      btnMismatch.addEventListener('click', () => {
        showToast("GIS Algorithm: Parcel Khasra 49 exceeds approved corridor envelope by 0.35 Ha (Northern boundary).");
        if (mapInstance && mapInstance.getLayer('parcelsLayer')) {
          mapInstance.setPaintProperty('parcelsLayer', 'fill-opacity', 0.85);
        }
      });
    }

    // Live GPS Geolocation Capture
    const btnGps = document.getElementById('btnCaptureLiveGps');
    if (btnGps) {
      btnGps.addEventListener('click', () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude.toFixed(4);
              const lon = pos.coords.longitude.toFixed(4);
              document.getElementById('mapCoordsReadout').innerText = `Live RTK-GPS Captured: ${lat}° N, ${lon}° E (Surveyor Unit)`;
              document.getElementById('fieldGpsCoords').value = `${lat}° N, ${lon}° E`;
              showToast(`Real-time GPS boundary locked at ${lat}° N, ${lon}° E!`);
            },
            () => {
              // Fallback demo coordinates
              document.getElementById('fieldGpsCoords').value = "25.3176° N, 82.9739° E";
              showToast("Simulated GPS captured: 25.3176° N, 82.9739° E");
            }
          );
        }
      });
    }
  }

  // Enforcement of Specific RBAC Permissions
  function applyRolePermissions() {
    const role = sessionUser.role;
    const roleBadge = document.getElementById('roleClearanceBadge');
    const roleDisplay = document.getElementById('officerRoleDisplay');
    const avatar = document.getElementById('officerAvatarBadge');

    // 1. Cadastral Surveyor / Amin
    if (role === 'FIELD_SURVEYOR') {
      avatar.innerText = "AMIN";
      roleBadge.innerText = "Surveyor Field Clearance";
      roleDisplay.innerText = "Cadastral Surveyor / Amin";

      // Disable statutory decision buttons
      disableButton('btnRecommendForward', 'Requires SLAO or Nodal Officer Clearance');
      disableButton('btnRejectApplication', 'Statutory Rejection Power restricted to SLAO');
      disableButton('btnRequestCorrection', 'Requires Competent Authority Approval');

      // Lock RoR verification for Surveyor
      const landNav = document.getElementById('navItemLand');
      if (landNav) landNav.classList.add('is-disabled');
    }
    // 2. Revenue Officer (Tehsildar)
    else if (role === 'STATE_NODAL_OFFICER' || role === 'REVENUE_OFFICER') {
      avatar.innerText = "RO";
      roleBadge.innerText = "Revenue Scrutiny Clearance";
      roleDisplay.innerText = "Tehsildar / Revenue Officer";

      disableButton('btnRejectApplication', 'Rejection power restricted to Special Land Acquisition Collector');
    }
    // 3. Special Land Acquisition Collector (SLAO - Full Rejection & Recommendation Power)
    else {
      avatar.innerText = "SLAO";
      roleBadge.innerText = "SLAO Full Statutory Scrutiny";
      roleDisplay.innerText = "Special Land Acquisition Collector";
    }
  }

  function disableButton(btnId, hint) {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.disabled = true;
      btn.title = hint;
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
    }
  }

  // Render Functions
  function renderAll() {
    const activeReq = activeData[0];

    // Incoming requests table
    const tableBody = document.getElementById('incomingRequestsTableBody');
    tableBody.innerHTML = activeData.map(req => `
      <tr>
        <td>
          <strong class="font-mono text-cyan">${req.appId}</strong>
          <div style="font-size:0.75rem; color:#64748b;">${req.projId}</div>
        </td>
        <td><strong>${req.piaName}</strong></td>
        <td>${req.alignment}</td>
        <td>${req.extentHa.toFixed(2)} Ha</td>
        <td>₹ ${req.fundsCr.toFixed(2)} Cr</td>
        <td><span class="badge-status ${req.statusClass}">${req.status}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 10px; font-size:0.76rem;" onclick="window.officerApp.navigateTo('mod-land-records')">
            Scrutinize &rarr;
          </button>
        </td>
      </tr>
    `).join('');

    // Document table
    const docTable = document.getElementById('officerDocsTableBody');
    docTable.innerHTML = activeReq.documents.map((d, i) => `
      <tr>
        <td><strong>${d.title}</strong></td>
        <td>${d.cat}</td>
        <td><span class="font-mono font-bold">${d.ver}</span></td>
        <td>
          <span class="badge-status ${d.verified ? 'bs-verified' : 'bs-pending'}">
            ${d.verified ? 'Verified' : 'Pending Review'}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.72rem;" onclick="window.officerApp.toggleDocVerify(${i})">
            ${d.verified ? 'Revoke Sign-off' : 'Verify & Sign'}
          </button>
        </td>
      </tr>
    `).join('');

    // Land record comparison table
    const landTable = document.getElementById('landRecordComparisonTable');
    landTable.innerHTML = activeReq.khasraList.map((k, i) => `
      <tr>
        <td><strong>${k.village} &bull; Khasra ${k.khasra}</strong></td>
        <td>${k.areaClaimed} Ha</td>
        <td class="font-mono">${k.rorArea} Ha (${k.rorOwner})</td>
        <td>Private Agriculture</td>
        <td><span class="badge-status ${k.statusClass}">${k.status}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.72rem;" onclick="window.officerApp.verifyKhasra(${i})">
            Verify Khasra
          </button>
        </td>
      </tr>
    `).join('');

    // Checklist table
    const chkTable = document.getElementById('verificationChecklistBody');
    chkTable.innerHTML = activeReq.checklist.map((c, i) => `
      <tr>
        <td><strong>${c.param}</strong></td>
        <td>${c.dept}</td>
        <td>
          <span class="badge-status ${c.status === 'Verified' ? 'bs-verified' : 'bs-pending'}">
            ${c.status}
          </span>
        </td>
        <td style="color:#475569; font-size:0.82rem;">${c.notes}</td>
      </tr>
    `).join('');

    // Audit trail
    const auditBody = document.getElementById('auditTrailTableBody');
    auditBody.innerHTML = activeReq.auditHistory.map(a => `
      <tr>
        <td class="font-mono">${a.time}</td>
        <td><strong>${a.officer}</strong></td>
        <td class="font-mono text-cyan">${activeReq.appId}</td>
        <td>${a.action}</td>
        <td><span class="badge-status bs-pending">${a.from}</span></td>
        <td><span class="badge-status bs-review">${a.to}</span></td>
      </tr>
    `).join('');

    // Search table
    const searchBody = document.getElementById('searchResultsTableBody');
    searchBody.innerHTML = activeReq.khasraList.map(k => `
      <tr>
        <td class="font-mono text-cyan">${activeReq.appId}</td>
        <td>${activeReq.projId}</td>
        <td>${k.village}</td>
        <td>Khasra ${k.khasra}</td>
        <td><span class="badge-status ${k.statusClass}">${k.status}</span></td>
      </tr>
    `).join('');

    // Notifications
    const notifContainer = document.getElementById('officerNotifContainer');
    notifContainer.innerHTML = `
      <div class="urgent-alert-box" style="margin-bottom:12px;">
        <strong>Section 25 Statutory Timeline Alert</strong>
        <p>12-month limit between Section 19 declaration and Section 23 award inquiry is at 310 days. Expedite inquiry for Package IV.</p>
      </div>
      <div class="feed-item">
        <span>New JMS document uploaded by NHAI PIU Varanasi for review.</span>
        <span class="font-mono text-cyan">2h ago</span>
      </div>
    `;
  }

  // Interconnection & Statutory Decision Logic (Rejection Power)
  function setupDecisionWorkflow() {
    const remarksField = document.getElementById('decisionRemarks');

    // 1. REJECTION WITH CAUSE (Requested by User)
    const btnReject = document.getElementById('btnRejectApplication');
    if (btnReject) {
      btnReject.addEventListener('click', () => {
        const remarks = remarksField.value.trim();
        if (!remarks) {
          alert("Error: Official statutory grounds for rejection must be documented in the remarks field.");
          return;
        }

        // Update Officer and Shared Storage State
        activeData[0].status = "Rejected by District Authority";
        activeData[0].statusClass = "bs-rejected";
        activeData[0].auditHistory.unshift({
          time: new Date().toLocaleString(),
          officer: sessionUser.role + " (Varanasi)",
          action: "Requisition Rejected under Section 15 Scrutiny",
          from: "Under District Scrutiny",
          to: "Rejected"
        });

        // LIVE INTERCONNECTION WITH PIA PORTAL: Update PIA Storage directly
        const piaStore = JSON.parse(localStorage.getItem('NLAMS_PIA_STATE'));
        if (piaStore && piaStore.projects.length > 0) {
          piaStore.projects[0].stage = "Rejected by CALA";
          piaStore.projects[0].stageClass = "stage-rejected";
          piaStore.notifications.unshift({
            id: Date.now(),
            title: "Requisition Rejected by District Collector",
            desc: `Reason: ${remarks}. Form A dossier returned to agency.`,
            time: "Just Now",
            urgent: true
          });
          localStorage.setItem('NLAMS_PIA_STATE', JSON.stringify(piaStore));
        }

        persistStore();
        renderAll();
        showToast("Application REJECTED with cause. Transmitted to PIA portal in real-time.");
        document.getElementById('stepDecisionNode').innerHTML = `<div class="dot" style="background:#e11d48; color:#fff;">&#10008;</div><span>Rejected with Cause</span>`;
      });
    }

    // 2. RETURN FOR CORRECTION
    const btnCorrection = document.getElementById('btnRequestCorrection');
    if (btnCorrection) {
      btnCorrection.addEventListener('click', () => {
        const remarks = remarksField.value.trim() || "Boundary discrepancy on Khasra 49. Upload revised JMS.";
        activeData[0].status = "Correction Required";
        activeData[0].statusClass = "bs-correct";
        
        // Live Sync with PIA
        const piaStore = JSON.parse(localStorage.getItem('NLAMS_PIA_STATE'));
        if (piaStore) {
          piaStore.projects[0].stage = "Correction Required";
          piaStore.notifications.unshift({
            id: Date.now(),
            title: "Correction Required by Tehsildar",
            desc: remarks,
            time: "Just Now",
            urgent: true
          });
          localStorage.setItem('NLAMS_PIA_STATE', JSON.stringify(piaStore));
        }

        persistStore();
        renderAll();
        showToast("Correction directive dispatched to PIA portal.");
      });
    }

    // 3. RECOMMEND & FORWARD
    const btnForward = document.getElementById('btnRecommendForward');
    if (btnForward) {
      btnForward.addEventListener('click', () => {
        activeData[0].status = "Recommended & Forwarded";
        activeData[0].statusClass = "bs-verified";
        
        const piaStore = JSON.parse(localStorage.getItem('NLAMS_PIA_STATE'));
        if (piaStore) {
          piaStore.projects[0].stage = "State Review";
          piaStore.notifications.unshift({
            id: Date.now(),
            title: "Dossier Verified & Forwarded",
            desc: "District Collector signed off. Forwarded to State Revenue Secretariat for Gazette.",
            time: "Just Now",
            urgent: false
          });
          localStorage.setItem('NLAMS_PIA_STATE', JSON.stringify(piaStore));
        }

        persistStore();
        renderAll();
        showToast("Requisition verified and forwarded to State Revenue Secretariat!");
        document.getElementById('stepGovReviewNode').className = "step-item active";
      });
    }
  }

  // Navigation Controller
  function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const panes = document.querySelectorAll('.module-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.mod;
        navigateTo(target);
      });
    });

    const drawer = document.getElementById('drawerToggle');
    const sidebar = document.getElementById('officerSidebar');
    if (drawer && sidebar) {
      drawer.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  function navigateTo(modId) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.mod === modId));
    document.querySelectorAll('.module-pane').forEach(p => p.classList.toggle('active', p.id === modId));
    
    if (modId === 'mod-gis') {
      setTimeout(initMapLibreGIS, 150);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Global Namespace Handlers
  window.officerApp = {
    navigateTo,
    toggleDocVerify: function (idx) {
      activeData[0].documents[idx].verified = !activeData[0].documents[idx].verified;
      persistStore();
      renderAll();
      showToast("Document verification status toggled.");
    },
    verifyKhasra: function (idx) {
      activeData[0].khasraList[idx].status = "Verified";
      activeData[0].khasraList[idx].statusClass = "bs-verified";
      persistStore();
      renderAll();
      showToast(`Khasra ${activeData[0].khasraList[idx].khasra} authenticated with RoR.`);
    }
  };

  // Search Filter Handler
  function setupSearch() {
    const input = document.getElementById('searchFilterInput');
    if (!input) return;
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#searchResultsTableBody tr');
      rows.forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // DOM Boot
  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    applyRolePermissions();
    setupDecisionWorkflow();
    setupSearch();
    renderAll();
  });
})();