const AcademicContext = require('../models/AcademicContext');
const VisionMission = require('../models/VisionMission');
const CourseOutcome = require('../models/CourseOutcome');
const COPOMatrix = require('../models/COPOMatrix');
const Attainment = require('../models/Attainment');
const ActionReport = require('../models/ActionReport');
const PIMapping = require('../models/PIMapping');
const Activity = require('../models/Activity');
const User = require('../models/User');

const getAttainmentColor = (level) => {
  if (level >= 3) return '#22c55e';
  if (level >= 2) return '#eab308';
  if (level >= 1) return '#f97316';
  return '#ef4444';
};

const generatePDFHTML = async (contextId) => {
  const context = await AcademicContext.findById(contextId)
    .populate('champion', 'name designation')
    .populate('instructors', 'name designation');
  const vm = await VisionMission.findOne({ contextId });
  const coDoc = await CourseOutcome.findOne({ contextId });
  const copoDoc = await COPOMatrix.findOne({ contextId });
  const attainment = await Attainment.findOne({ contextId });
  const actionReport = await ActionReport.findOne({ contextId });
  const actDoc = await Activity.findOne({ contextId });

  const cos = coDoc ? coDoc.cos.filter(c => c.isActive) : [];
  const poList = ['PO1','PO2','PO3','PO4','PO5','PO6','PO7','PO8','PO9','PO10','PO11','PSO1','PSO2','PSO3'];

  const header = `
    <div class="page-header">
      <div class="college-name">MIT Academy of Engineering, Alandi (D), Pune - 412105</div>
      <div class="dept-name">Department of ${context.branch}</div>
      <div class="doc-info">
        <span>Academic Year: ${context.academicYear}</span>
        <span>Semester: ${context.semester}</span>
        <span>Subject: ${context.subjectName} (${context.subjectCode})</span>
      </div>
    </div>
  `;

  const signatureBlock = `
    <div class="signature-block">
      <div class="sig-item"><div class="sig-line"></div><div>Course Teacher</div><div>${context.instructors.map(i=>i.name).join(', ')}</div></div>
      <div class="sig-item"><div class="sig-line"></div><div>Course Champion</div><div>${context.champion?.name || ''}</div></div>
      <div class="sig-item"><div class="sig-line"></div><div>HOD / Dean</div></div>
    </div>
  `;

  // CO-PO Matrix HTML
  let copoHTML = '<table class="matrix-table"><thead><tr><th>CO</th>';
  poList.forEach(po => { copoHTML += `<th>${po}</th>`; });
  copoHTML += '</tr></thead><tbody>';
  if (copoDoc) {
    copoDoc.matrix.forEach(row => {
      copoHTML += `<tr><td><strong>${row.coNo}</strong></td>`;
      poList.forEach(po => {
        const val = row[po];
        const bg = val === 3 ? '#bbf7d0' : val === 2 ? '#fef9c3' : val === 1 ? '#fed7aa' : '#f3f4f6';
        copoHTML += `<td style="background:${bg}">${val || ''}</td>`;
      });
      copoHTML += '</tr>';
    });
    // Averages row
    copoHTML += '<tr style="background:#e5e7eb;font-weight:bold"><td>AVG</td>';
    poList.forEach(po => {
      const avg = copoDoc.averages?.[po];
      copoHTML += `<td>${avg ? avg.toFixed(2) : ''}</td>`;
    });
    copoHTML += '</tr>';
  }
  copoHTML += '</tbody></table>';

  // CO Attainment Table
  let coAttHTML = '';
  if (attainment) {
    coAttHTML = `<table class="data-table"><thead><tr>
      <th>CO</th><th>Target%</th><th>CIE%</th><th>CIE Level</th>
      <th>ESE%</th><th>ESE Level</th><th>Direct Level</th>
      <th>Survey%</th><th>Indirect Level</th><th style="background:#dbeafe">Final Level</th>
    </tr></thead><tbody>`;
    attainment.coAttainment.forEach(co => {
      coAttHTML += `<tr>
        <td><strong>${co.coNo}</strong></td>
        <td>${cos.find(c=>c.coNo===co.coNo)?.targetPercent || 55}%</td>
        <td>${co.ciePercent?.toFixed(2) || '-'}</td>
        <td style="background:${getAttainmentColor(co.cieLevel)};color:white">${co.cieLevel || '-'}</td>
        <td>${co.esePercent?.toFixed(2) || '-'}</td>
        <td style="background:${getAttainmentColor(co.eseLevel)};color:white">${co.eseLevel || '-'}</td>
        <td style="background:${getAttainmentColor(co.directLevel)};color:white">${co.directLevel}</td>
        <td>${co.surveyPercent?.toFixed(2) || '-'}</td>
        <td style="background:${getAttainmentColor(co.indirectLevel)};color:white">${co.indirectLevel || 0}</td>
        <td style="background:${getAttainmentColor(co.finalLevel)};color:white;font-weight:bold">${co.finalLevel?.toFixed(4) || '-'}</td>
      </tr>`;
    });
    coAttHTML += '</tbody></table>';
  }

  // PO Attainment Table
  let poAttHTML = '';
  if (attainment) {
    poAttHTML = `<table class="data-table"><thead><tr><th>PO/PSO</th><th>Target</th><th>Achieved</th><th>% Achievement</th></tr></thead><tbody>`;
    attainment.poAttainment.filter(p => p.target !== null).forEach(po => {
      const pct = po.percentAchievement || 0;
      poAttHTML += `<tr>
        <td><strong>${po.poNo}</strong></td>
        <td>${po.target?.toFixed(2) || '-'}</td>
        <td>${po.achieved?.toFixed(2) || '-'}</td>
        <td style="background:${pct>=85?'#bbf7d0':pct>=75?'#fef9c3':pct>=65?'#fed7aa':'#fecaca'}">${pct.toFixed(2)}%</td>
      </tr>`;
    });
    poAttHTML += '</tbody></table>';
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; color: #111; }
    .page { padding: 20px 30px; page-break-after: always; }
    .page-header { border-bottom: 2px solid #1e3a5f; margin-bottom: 15px; padding-bottom: 10px; }
    .college-name { font-size: 14px; font-weight: bold; color: #1e3a5f; }
    .dept-name { font-size: 12px; color: #374151; }
    .doc-info { display: flex; gap: 20px; font-size: 10px; color: #6b7280; margin-top: 4px; }
    .section-title { background: #1e3a5f; color: white; padding: 6px 12px; font-size: 13px; font-weight: bold; margin: 15px 0 10px 0; }
    .format-no { font-size: 10px; color: #6b7280; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
    th { background: #1e3a5f; color: white; padding: 5px; text-align: center; }
    td { border: 1px solid #d1d5db; padding: 4px 6px; }
    tr:nth-child(even) { background: #f9fafb; }
    .matrix-table th, .matrix-table td { text-align: center; padding: 3px; font-size: 9px; }
    .data-table td { text-align: center; }
    .signature-block { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 10px; border-top: 1px solid #d1d5db; }
    .sig-item { text-align: center; width: 30%; }
    .sig-line { border-bottom: 1px solid #374151; height: 30px; margin-bottom: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .info-item { padding: 6px; border: 1px solid #e5e7eb; border-radius: 4px; }
    .info-label { font-weight: bold; color: #374151; font-size: 9px; }
    .info-value { color: #111; font-size: 10px; }
    .co-statement { border-left: 3px solid #1e3a5f; padding: 6px 10px; margin: 6px 0; background: #f8fafc; }
    .legend { display: flex; gap: 10px; font-size: 9px; margin-bottom: 8px; }
    .legend-item { display: flex; align-items: center; gap: 4px; }
    .legend-box { width: 12px; height: 12px; border-radius: 2px; }
  </style></head><body>

  <!-- COVER PAGE -->
  <div class="page">
    <div style="text-align:center; padding: 60px 20px;">
      <div style="font-size:20px;font-weight:bold;color:#1e3a5f;margin-bottom:10px">MIT Academy of Engineering</div>
      <div style="font-size:14px;color:#374151;margin-bottom:30px">Alandi (D), Pune - 412105</div>
      <div style="font-size:24px;font-weight:bold;color:#1e3a5f;border:3px solid #1e3a5f;padding:20px;margin:20px 0">COURSE FILE</div>
      <table style="margin:20px auto;width:60%;text-align:left">
        <tr><td style="font-weight:bold;padding:6px">Department</td><td>${context.branch}</td></tr>
        <tr><td style="font-weight:bold;padding:6px">Subject</td><td>${context.subjectName}</td></tr>
        <tr><td style="font-weight:bold;padding:6px">Subject Code</td><td>${context.subjectCode}</td></tr>
        <tr><td style="font-weight:bold;padding:6px">Class</td><td>${context.class || ''} | Div: ${context.divisions?.join(', ')}</td></tr>
        <tr><td style="font-weight:bold;padding:6px">Academic Year</td><td>${context.academicYear}</td></tr>
        <tr><td style="font-weight:bold;padding:6px">Semester</td><td>${context.semester}</td></tr>
        <tr><td style="font-weight:bold;padding:6px">Course Teacher</td><td>${context.instructors?.map(i=>i.name).join(', ')}</td></tr>
        <tr><td style="font-weight:bold;padding:6px">Course Champion</td><td>${context.champion?.name || ''}</td></tr>
      </table>
      <div style="font-size:10px;color:#6b7280;margin-top:30px">Records: MITAOE/ACAD/INST/1 to INST/16 | Retention: 5 Years</div>
    </div>
  </div>

  <!-- VISION MISSION -->
  <div class="page">
    ${header}
    <div class="format-no">Format: ACAD/DI/1A — Vision & Mission of Institute</div>
    <div class="section-title">VISION, MISSION AND QUALITY POLICY OF INSTITUTE</div>
    <div class="info-item" style="margin-bottom:10px"><div class="info-label">VISION</div><div class="info-value">${vm?.institute?.vision || 'To be entered'}</div></div>
    <div class="info-item" style="margin-bottom:10px"><div class="info-label">MISSION</div><div class="info-value">${vm?.institute?.mission || 'To be entered'}</div></div>
    <div class="info-item"><div class="info-label">QUALITY POLICY</div><div class="info-value">${vm?.institute?.qualityPolicy || 'To be entered'}</div></div>

    <div class="format-no" style="margin-top:20px">Format: ACAD/DI/1B — Vision & Mission of Department</div>
    <div class="section-title">VISION, MISSION AND PEOs OF DEPARTMENT</div>
    <div class="info-item" style="margin-bottom:10px"><div class="info-label">VISION</div><div class="info-value">${vm?.department?.vision || 'To be entered'}</div></div>
    <div class="info-item" style="margin-bottom:10px"><div class="info-label">MISSION</div><div class="info-value">${vm?.department?.mission || 'To be entered'}</div></div>
    ${vm?.department?.PEOs?.length ? `
      <div class="section-title">PROGRAM EDUCATIONAL OBJECTIVES (PEOs)</div>
      ${vm.department.PEOs.map(peo => `<div class="co-statement"><strong>PEO ${peo.no}:</strong> ${peo.statement}</div>`).join('')}
    ` : ''}
    ${signatureBlock}
  </div>

  <!-- CO-PO MAPPING -->
  <div class="page">
    ${header}
    <div class="format-no">Format: ACAD/DI/6C — CO-PO Mapping</div>
    <div class="section-title">COURSE ARTICULATION MATRIX (CO-PO MAPPING)</div>
    <div class="legend">
      <div class="legend-item"><div class="legend-box" style="background:#bbf7d0"></div> 3 = High</div>
      <div class="legend-item"><div class="legend-box" style="background:#fef9c3"></div> 2 = Medium</div>
      <div class="legend-item"><div class="legend-box" style="background:#fed7aa"></div> 1 = Low</div>
      <div class="legend-item"><div class="legend-box" style="background:#f3f4f6"></div> Blank = Not Mapped</div>
    </div>
    ${copoHTML}

    <div class="section-title" style="margin-top:20px">COURSE OUTCOMES</div>
    ${cos.map(co => `<div class="co-statement"><strong>${co.coNo}</strong> [${co.bloomsLevel}]: ${co.statement}</div>`).join('')}
    ${signatureBlock}
  </div>

  <!-- CO ATTAINMENT -->
  <div class="page">
    ${header}
    <div class="format-no">Format: ACAD/DI/14A — CO Attainment</div>
    <div class="section-title">COURSE OUTCOME ATTAINMENT</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Attainment Levels</div>
        <div>Level 1: ≥${attainment?.thresholds?.level1 || 65}% | Level 2: ≥${attainment?.thresholds?.level2 || 75}% | Level 3: ≥${attainment?.thresholds?.level3 || 85}%</div>
      </div>
      <div class="info-item"><div class="info-label">Weightage</div>
        <div>Direct: ${((attainment?.directWeight || 0.8)*100).toFixed(0)}% | Indirect: ${((attainment?.indirectWeight || 0.2)*100).toFixed(0)}%</div>
      </div>
    </div>
    <div class="legend">
      <div class="legend-item"><div class="legend-box" style="background:#22c55e"></div> Level 3</div>
      <div class="legend-item"><div class="legend-box" style="background:#eab308"></div> Level 2</div>
      <div class="legend-item"><div class="legend-box" style="background:#f97316"></div> Level 1</div>
      <div class="legend-item"><div class="legend-box" style="background:#ef4444"></div> Not Attained</div>
    </div>
    ${coAttHTML || '<p>Attainment not yet calculated</p>'}
    ${signatureBlock}
  </div>

  <!-- PO ATTAINMENT -->
  <div class="page">
    ${header}
    <div class="format-no">Format: ACAD/DI/14B — PO Attainment</div>
    <div class="section-title">PROGRAM OUTCOME ATTAINMENT</div>
    ${copoHTML}
    <div class="section-title" style="margin-top:15px">PO ATTAINMENT SUMMARY</div>
    ${poAttHTML || '<p>PO Attainment not yet calculated</p>'}
    ${signatureBlock}
  </div>

  <!-- ACTION TAKEN REPORT -->
  <div class="page">
    ${header}
    <div class="format-no">Format: ACAD/DI/14C — Action Taken Report</div>
    <div class="section-title">ACTION TAKEN REPORT</div>
    <div class="section-title" style="background:#16a34a">High Attainment</div>
    <table class="data-table"><thead><tr><th>PO/PSO</th><th>COs Mapped</th><th>Action Taken</th><th>Justification</th><th>Plan Next Year</th></tr></thead><tbody>
    ${actionReport?.highAttainment?.map(r => `<tr><td>${r.poNo}</td><td>${r.cosMapped?.join(', ')}</td><td>${r.actionTaken}</td><td>${r.justification}</td><td>${r.planNextYear}</td></tr>`).join('') || '<tr><td colspan="5">No entries</td></tr>'}
    </tbody></table>
    <div class="section-title" style="background:#dc2626;margin-top:15px">Low Attainment</div>
    <table class="data-table"><thead><tr><th>PO/PSO</th><th>COs Mapped</th><th>Action Taken</th><th>Justification</th><th>Plan Next Year</th></tr></thead><tbody>
    ${actionReport?.lowAttainment?.map(r => `<tr><td>${r.poNo}</td><td>${r.cosMapped?.join(', ')}</td><td>${r.actionTaken}</td><td>${r.justification}</td><td>${r.planNextYear}</td></tr>`).join('') || '<tr><td colspan="5">No entries</td></tr>'}
    </tbody></table>
    ${signatureBlock}
  </div>

  </body></html>`;
};

exports.generatePDF = async (req, res) => {
  try {
    const { contextId } = req.params;
    const html = await generatePDFHTML(contextId);

    // Use html-pdf-node
    const htmlPdf = require('html-pdf-node');
    const options = { format: 'A4', margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' } };
    const file = { content: html };

    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    const context = await AcademicContext.findById(contextId);
    const filename = `CourseFile_${context.subjectCode}_${context.academicYear}_Sem${context.semester}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ message: 'PDF generation failed: ' + err.message });
  }
};

exports.getPDFPreview = async (req, res) => {
  try {
    const { contextId } = req.params;
    const html = await generatePDFHTML(contextId);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
