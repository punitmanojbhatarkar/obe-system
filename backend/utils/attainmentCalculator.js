/**
 * Core OBE Attainment Calculation Engine
 * Based on MITAOE format (Pune University)
 */

const getAttainmentLevel = (percent, thresholds) => {
  const { level1 = 65, level2 = 75, level3 = 85 } = thresholds;
  if (percent >= level3) return 3;
  if (percent >= level2) return 2;
  if (percent >= level1) return 1;
  return 0;
};

/**
 * Calculate CO-wise attainment from student marks
 * @param {Array} students - list of students
 * @param {Array} marks - all StudentMarks documents
 * @param {Array} activities - all Activity documents (activities array)
 * @param {Array} cos - course outcomes
 * @param {Object} examScheme - { IA, MSE, ESE }
 * @param {Object} thresholds - { level1, level2, level3 }
 */
const calculateCOAttainment = (students, allMarks, activities, cos, examScheme, thresholds) => {
  const { IA = 30, MSE = 20, ESE = 50 } = examScheme;
  const activeCOs = cos.filter(co => co.isActive && co.statement);

  const coResults = activeCOs.map(co => {
    const coNo = co.coNo;

    // --- IA Calculation ---
    const iaActivities = activities.filter(a =>
      (a.type === 'IA' || a.type === 'Assignment' || a.type === 'Activity' || a.type === 'CA') &&
      a.cosMapped.includes(coNo)
    );

    let iaPercent = null;
    if (co.assessedIn.IA && iaActivities.length > 0) {
      const studentIAScores = students.map(student => {
        let totalObtained = 0, totalMax = 0;
        iaActivities.forEach(act => {
          const markDoc = allMarks.find(m =>
            m.studentId.toString() === student._id.toString() &&
            m.activityId.toString() === act._id.toString()
          );
          if (markDoc) {
            const coMark = markDoc.coMarks.find(cm => cm.coNo === coNo);
            if (coMark) {
              totalObtained += coMark.marksObtained || 0;
              totalMax += coMark.maxMarks || 0;
            }
          }
        });
        return totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      });
      iaPercent = studentIAScores.reduce((a, b) => a + b, 0) / studentIAScores.length;
    }

    // --- MSE Calculation ---
    const mseActivities = activities.filter(a => a.type === 'MSE' && a.cosMapped.includes(coNo));
    let msePercent = null;
    if (co.assessedIn.MSE && mseActivities.length > 0) {
      const studentMSEScores = students.map(student => {
        let totalObtained = 0, totalMax = 0;
        mseActivities.forEach(act => {
          const markDoc = allMarks.find(m =>
            m.studentId.toString() === student._id.toString() &&
            m.activityId.toString() === act._id.toString()
          );
          if (markDoc) {
            // Question-wise for MSE
            if (markDoc.questionMarks && markDoc.questionMarks.length > 0) {
              markDoc.questionMarks.forEach(qm => {
                if (qm.coMapped === coNo) {
                  totalObtained += qm.marksObtained || 0;
                  totalMax += qm.maxMarks || 0;
                }
              });
            } else {
              const coMark = markDoc.coMarks.find(cm => cm.coNo === coNo);
              if (coMark) {
                totalObtained += coMark.marksObtained || 0;
                totalMax += coMark.maxMarks || 0;
              }
            }
          }
        });
        return totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      });
      msePercent = studentMSEScores.reduce((a, b) => a + b, 0) / studentMSEScores.length;
    }

    // --- CIE Combined ---
    let ciePercent = null;
    let cieLevel = 0;
    if (iaPercent !== null || msePercent !== null) {
      const iaWeight = co.assessedIn.IA ? IA : 0;
      const mseWeight = co.assessedIn.MSE ? MSE : 0;
      const totalWeight = iaWeight + mseWeight;
      if (totalWeight > 0) {
        ciePercent = ((iaPercent || 0) * iaWeight + (msePercent || 0) * mseWeight) / totalWeight;
        cieLevel = getAttainmentLevel(ciePercent, thresholds);
      }
    }

    // --- ESE Calculation ---
    const eseActivities = activities.filter(a => a.type === 'ESE' && a.cosMapped.includes(coNo));
    let esePercent = null;
    let eseLevel = 0;
    if (co.assessedIn.ESE && eseActivities.length > 0) {
      const studentESEScores = students.map(student => {
        let totalObtained = 0, totalMax = 0;
        eseActivities.forEach(act => {
          const markDoc = allMarks.find(m =>
            m.studentId.toString() === student._id.toString() &&
            m.activityId.toString() === act._id.toString()
          );
          if (markDoc) {
            if (markDoc.questionMarks && markDoc.questionMarks.length > 0) {
              markDoc.questionMarks.forEach(qm => {
                if (qm.coMapped === coNo) {
                  totalObtained += qm.marksObtained || 0;
                  totalMax += qm.maxMarks || 0;
                }
              });
            } else {
              const coMark = markDoc.coMarks.find(cm => cm.coNo === coNo);
              if (coMark) {
                totalObtained += coMark.marksObtained || 0;
                totalMax += coMark.maxMarks || 0;
              }
            }
          }
        });
        return totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      });
      esePercent = studentESEScores.reduce((a, b) => a + b, 0) / studentESEScores.length;
      eseLevel = getAttainmentLevel(esePercent, thresholds);
    }

    // --- Direct Attainment ---
    let directAvgPercent = null;
    let directLevel = 0;
    const validPercentages = [ciePercent, esePercent].filter(p => p !== null);
    if (validPercentages.length > 0) {
      directAvgPercent = validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length;
      directLevel = getAttainmentLevel(directAvgPercent, thresholds);
    }

    return {
      coNo,
      iaPercent: iaPercent ? parseFloat(iaPercent.toFixed(4)) : null,
      msePercent: msePercent ? parseFloat(msePercent.toFixed(4)) : null,
      ciePercent: ciePercent ? parseFloat(ciePercent.toFixed(4)) : null,
      cieLevel,
      esePercent: esePercent ? parseFloat(esePercent.toFixed(4)) : null,
      eseLevel,
      directAvgPercent: directAvgPercent ? parseFloat(directAvgPercent.toFixed(4)) : null,
      directLevel
    };
  });

  return coResults;
};

/**
 * Merge indirect attainment (exit survey) into CO attainment
 */
const mergeIndirectAttainment = (coAttainment, surveyAverages, thresholds, directWeight = 0.8, indirectWeight = 0.2) => {
  return coAttainment.map(co => {
    const survey = surveyAverages.find(s => s.coNo === co.coNo);
    const surveyPercent = survey ? survey.avgPercent : null;
    const indirectLevel = surveyPercent !== null ? getAttainmentLevel(surveyPercent, thresholds) : 0;
    const finalLevel = parseFloat(
      (co.directLevel * directWeight + indirectLevel * indirectWeight).toFixed(4)
    );
    return { ...co, surveyPercent, indirectLevel, finalLevel };
  });
};

/**
 * Calculate PO Attainment from CO attainment + CO-PO matrix
 */
const calculatePOAttainment = (coAttainment, copoMatrix) => {
  const poList = ['PO1','PO2','PO3','PO4','PO5','PO6','PO7','PO8','PO9','PO10','PO11','PSO1','PSO2','PSO3'];

  return poList.map(poNo => {
    const contributions = [];
    const targets = [];

    coAttainment.forEach(co => {
      const matrixRow = copoMatrix.find(m => m.coNo === co.coNo);
      if (!matrixRow) return;
      const mappingValue = matrixRow[poNo];
      if (mappingValue && mappingValue > 0) {
        const contribution = (co.finalLevel || 0) * mappingValue / 3;
        contributions.push(contribution);
        targets.push(mappingValue);
      }
    });

    if (contributions.length === 0) return { poNo, target: null, achieved: null, percentAchievement: null };

    const achieved = contributions.reduce((a, b) => a + b, 0) / contributions.length;
    const target = targets.reduce((a, b) => a + b, 0) / targets.length;
    const percentAchievement = target > 0 ? (achieved / target) * 100 : 0;

    return {
      poNo,
      target: parseFloat(target.toFixed(4)),
      achieved: parseFloat(achieved.toFixed(4)),
      percentAchievement: parseFloat(percentAchievement.toFixed(4))
    };
  });
};

/**
 * Auto-calculate CO-PO mapping values from PI mapping (Y/N → 1/2/3)
 */
const calculateCOPOFromPI = (piMappings) => {
  const cos = ['CO1','CO2','CO3','CO4','CO5','CO6'];
  const poGroups = {};

  piMappings.forEach(pi => {
    if (!poGroups[pi.poNo]) poGroups[pi.poNo] = [];
    poGroups[pi.poNo].push(pi.coMapping);
  });

  const result = cos.map(coNo => {
    const row = { coNo };
    Object.keys(poGroups).forEach(poNo => {
      const indicators = poGroups[poNo];
      const totalIndicators = indicators.length;
      const yCount = indicators.filter(ind => ind[coNo] === 'Y').length;
      const ratio = totalIndicators > 0 ? yCount / totalIndicators : 0;

      if (ratio === 0) row[poNo] = null;
      else if (ratio <= 0.33) row[poNo] = 1;
      else if (ratio <= 0.66) row[poNo] = 2;
      else row[poNo] = 3;
    });
    return row;
  });

  return result;
};

module.exports = {
  getAttainmentLevel,
  calculateCOAttainment,
  mergeIndirectAttainment,
  calculatePOAttainment,
  calculateCOPOFromPI
};
