import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MATRIX_PATH = path.resolve(
  __dirname,
  "../../.bob/skills/evidence-triage/evidence-priority-matrix.csv"
);

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

function loadMatrix() {
  if (!fs.existsSync(MATRIX_PATH)) {
    throw new Error(`Evidence matrix not found: ${MATRIX_PATH}`);
  }

  const content = fs.readFileSync(MATRIX_PATH, "utf8");

  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    throw new Error("Evidence matrix is empty.");
  }

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

const evidenceMatrix = loadMatrix();

console.log(`Loaded ${evidenceMatrix.length} evidence matrix rows.`);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length >= 3);
}

function calculateSimilarity(input, candidate) {
  const inputWords = new Set(tokenize(input));
  const candidateWords = new Set(tokenize(candidate));

  if (!inputWords.size || !candidateWords.size) {
    return 0;
  }

  let matches = 0;

  for (const word of inputWords) {
    if (candidateWords.has(word)) {
      matches++;
    }
  }

  const overlapScore =
    matches / Math.max(inputWords.size, candidateWords.size);

  const candidateCoverage =
    matches / candidateWords.size;

  return Math.max(overlapScore, candidateCoverage);
}

function crimeTypeMatches(row, crimeType) {
  const applicable = normalize(row.Applicable_Crime_Types);
  const crime = normalize(crimeType);

  if (!crime) {
    return true;
  }

  if (applicable === "any") {
    return true;
  }

  return applicable.includes(crime);
}

function findBestEvidenceMatch(description, crimeType) {
  const normalizedDescription = normalize(description);

  if (!normalizedDescription) {
    return null;
  }

  const keywordGroups = [
    {
      keywords: ["cigarette", "cigarette butt", "butt", "smoking"],
      names: ["cigarette"]
    },
    {
      keywords: ["mobile", "phone", "smartphone", "cellphone"],
      names: ["mobile phone", "cell phone", "phone"]
    },
    {
      keywords: ["cctv", "dvr", "surveillance", "camera"],
      names: ["cctv", "dvr", "surveillance"]
    },
    {
      keywords: ["blood", "bloodstain", "blood stained", "blood-stained"],
      names: ["blood", "blood stain", "bloodstain"]
    },
    {
      keywords: ["glass", "glass fragment", "broken glass"],
      names: ["glass"]
    },
    {
      keywords: ["footprint", "shoe print", "shoeprint", "foot mark"],
      names: ["footprint", "shoe"]
    },
    {
      keywords: ["cloth", "clothing", "fabric", "textile", "torn cloth"],
      names: ["cloth", "clothing", "fabric"]
    },
    {
      keywords: ["plastic bottle", "bottle"],
      names: ["bottle"]
    },
    {
      keywords: ["tyre", "tire", "tyre mark", "tire mark"],
      names: ["tyre", "tire"]
    }
  ];

  let bestMatch = null;
  let bestScore = 0;

  for (const row of evidenceMatrix) {
    const itemName = normalize(row.Item_Name);
    const subType = normalize(row.Sub_Type);
    const category = normalize(row.Evidence_Category);

    let score = 0;

    const directNameScore = calculateSimilarity(
      normalizedDescription,
      itemName
    );

    const subtypeScore = calculateSimilarity(
      normalizedDescription,
      subType
    );

    const categoryScore = calculateSimilarity(
      normalizedDescription,
      category
    );

    score = Math.max(
      score,
      directNameScore,
      subtypeScore * 0.75,
      categoryScore * 0.4
    );

    for (const group of keywordGroups) {
      const inputMatchesKeyword = group.keywords.some((keyword) =>
        normalizedDescription.includes(normalize(keyword))
      );

      if (!inputMatchesKeyword) {
        continue;
      }

      const rowMatchesKeyword = group.names.some(
        (keyword) =>
          itemName.includes(normalize(keyword)) ||
          subType.includes(normalize(keyword)) ||
          category.includes(normalize(keyword))
      );

      if (rowMatchesKeyword) {
        score += 0.35;
      }
    }

    if (crimeTypeMatches(row, crimeType)) {
      score += 0.1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = row;
    }
  }

  if (!bestMatch || bestScore < 0.25) {
    return null;
  }

  return {
    row: bestMatch,
    matchScore: Math.min(bestScore, 1)
  };
}

function getBasePriority(row) {
  const value = Number(row.Priority_Score);

  if (value >= 5) {
    return 5;
  }

  if (value === 4) {
    return 4;
  }

  if (value === 3) {
    return 3;
  }

  if (value === 2) {
    return 2;
  }

  return 1;
}

function getPriorityLabel(priority) {
  switch (priority) {
    case 5:
      return "Immediate";
    case 4:
      return "Same day";
    case 3:
      return "Standard 48-72h";
    case 2:
      return "Batch";
    default:
      return "No lab action";
  }
}

function isAdverseCondition(condition) {
  const value = normalize(condition);

  return [
    "wet",
    "moist",
    "rain",
    "water",
    "heat",
    "hot",
    "humid",
    "sunlight",
    "exposed",
    "outdoor"
  ].some((word) => value.includes(word));
}

// Items that are mundane-looking but carry biological or trace evidence.
// Matches the HIDDEN VALUE definition in the Bob evidence-triage skill (Step 3).
const HIDDEN_VALUE_ITEM_KEYWORDS = [
  "cigarette",
  "butt",
  "bottle",
  "cup",
  "glass",
  "chewing gum",
  "gum",
  "glove",
  "fabric",
  "cloth",
  "torn",
  "wrapper",
  "snack",
  "straw",
  "tissue",
  "napkin"
];

// Crime types that qualify as violent/serious for the HIDDEN VALUE raise rule.
const VIOLENT_CRIME_TYPES = [
  "murder",
  "homicide",
  "assault",
  "robbery",
  "sexual assault",
  "rape",
  "kidnapping",
  "hit and run",
  "arson",
  "bombing"
];

// Returns true when the item description matches a mundane bio-trace carrier
// AND the crime type is violent — per the Bob skill Step 3 HIDDEN VALUE rule.
function isHiddenValueItem(description, crimeType) {
  const desc = normalize(description);
  const crime = normalize(crimeType || "");

  const isMundane = HIDDEN_VALUE_ITEM_KEYWORDS.some((kw) =>
    desc.includes(normalize(kw))
  );

  const isViolentScene = VIOLENT_CRIME_TYPES.some((ct) =>
    crime.includes(normalize(ct))
  );

  return isMundane && isViolentScene;
}

function isDuplicate(description, previousDescriptions) {
  const current = normalize(description);

  return previousDescriptions.some((previous) => {
    const similarity = calculateSimilarity(current, previous);
    return similarity >= 0.8;
  });
}

// Applies scene-context priority adjustment per the Bob evidence-triage skill Step 3.
// Rule: at most ONE level up OR one level down. Both directions cannot apply simultaneously.
// Raise-triggers are evaluated first; if any raise applies, no lower is applied.
function adjustPriority(row, input, basePriority, previousDescriptions) {
  let finalPriority = basePriority;
  const reasons = [];
  let hiddenValue = false;

  const description = input.description || "";
  const crimeType = input.crimeType || "";

  // --- Raise triggers (apply at most one level up) ---
  let raised = false;

  // HIDDEN VALUE: mundane bio-trace item at a violent crime scene.
  if (!raised && isHiddenValueItem(description, crimeType)) {
    if (finalPriority < 5) {
      finalPriority++;
      hiddenValue = true;
      raised = true;
      reasons.push(
        "HIDDEN VALUE: mundane item that can carry biological or trace evidence at a violent crime scene. Easy to overlook on first sweep."
      );
    }
  }

  // Adverse conditions speed up degradation.
  if (!raised && isAdverseCondition(input.condition)) {
    const degradation = normalize(row.Degradation_Speed);

    if (
      degradation.includes("fast") ||
      degradation.includes("rapid") ||
      degradation.includes("very fast") ||
      degradation.includes("volatile")
    ) {
      if (finalPriority < 5) {
        finalPriority++;
        raised = true;
        reasons.push(
          "Raised one level: adverse scene conditions may accelerate degradation."
        );
      }
    }
  }

  // --- Lower triggers (apply at most one level down, only if no raise was applied) ---
  if (!raised) {
    let lowered = false;

    if (
      !lowered &&
      row.Applicable_Crime_Types &&
      normalize(row.Applicable_Crime_Types) !== "any" &&
      !crimeTypeMatches(row, crimeType)
    ) {
      if (finalPriority > 1) {
        finalPriority--;
        lowered = true;
        reasons.push(
          "Lowered one level: matrix does not list this crime type for this evidence category."
        );
      }
    }

    if (!lowered && isDuplicate(description, previousDescriptions)) {
      if (finalPriority > 1) {
        finalPriority--;
        reasons.push(
          "Lowered one level: appears to duplicate an already-listed evidence item."
        );
      }
    }
  }

  finalPriority = Math.max(1, Math.min(5, finalPriority));

  if (!reasons.length) {
    reasons.push("No context adjustment applied.");
  }

  return {
    finalPriority,
    reasons,
    hiddenValue
  };
}

// Returns the URGENT flag for an evidence item per the Bob skill Step 4 rules:
//   - final priority 5 → URGENT
//   - AUTO_ESCALATE_URGENT → URGENT
//   - AUTO_ESCALATE_LAB → URGENT
//   - AUTO_ESCALATE_SAEK → URGENT (+ SAEK protocol note)
// HIDDEN_VALUE is tracked separately in adjustPriority and merged at call site.
function getUrgentFlag(row, priority) {
  const matrixFlag = normalize(row.Automation_Flag_Trigger);

  const urgent =
    priority === 5 ||
    matrixFlag === "auto escalate urgent" ||
    matrixFlag === "auto escalate lab" ||
    matrixFlag === "auto escalate saek";

  if (!urgent) {
    return {
      urgent: false,
      flag: "NORMAL",
      note: ""
    };
  }

  if (matrixFlag === "auto escalate saek") {
    return {
      urgent: true,
      flag: "AUTO_ESCALATE_SAEK",
      note: "This item must go through the sexual assault evidence kit protocol."
    };
  }

  if (matrixFlag === "auto escalate lab") {
    return {
      urgent: true,
      flag: "AUTO_ESCALATE_LAB",
      note: "Escalate to laboratory examination immediately."
    };
  }

  if (matrixFlag === "auto escalate urgent") {
    return {
      urgent: true,
      flag: "AUTO_ESCALATE_URGENT",
      note: "Urgent forensic examination indicated by matrix."
    };
  }

  return {
    urgent: true,
    flag: "URGENT",
    note: "Immediate forensic attention indicated."
  };
}

function buildReason(
  row,
  basePriority,
  finalPriority,
  adjustmentReasons
) {
  const reasons = [
    `Matrix base priority is ${basePriority}/5.`,
    `Probative value: ${row.Probative_Value || "not specified"}.`,
    `Degradation speed: ${row.Degradation_Speed || "not specified"}.`
  ];

  if (finalPriority !== basePriority) {
    reasons.push(...adjustmentReasons);
  }

  return reasons.join(" ");
}

function processEvidenceItem(input, previousDescriptions) {
  const description = input.description || input.item || "";

  const match = findBestEvidenceMatch(
    description,
    input.crimeType || ""
  );

  if (!match) {
    return {
      item: description,
      matrixId: "UNMATCHED",
      category: "Not in matrix",
      subType: "",
      basePriority: 3,
      finalPriority: 3,
      priorityLabel: "Standard 48-72h",
      flag: "NORMAL",
      urgent: false,
      urgentNote: "",
      testingRequired: "Needs examiner assessment",
      collectionMethod: "Follow local forensic collection SOP.",
      chainOfCustodySensitivity:
        "Follow local chain-of-custody SOP.",
      reason:
        "No sufficiently strong match was found in the evidence priority matrix. A provisional priority of 3/5 is used and must be reviewed by a qualified examiner.",
      matchScore: 0,
      matrixProbativeValue: "",
      degradationSpeed: "",
      automationFlagTrigger: ""
    };
  }

  const row = match.row;

  const basePriority = getBasePriority(row);

  const adjustment = adjustPriority(
    row,
    input,
    basePriority,
    previousDescriptions
  );

  const urgentFlag = getUrgentFlag(
    row,
    adjustment.finalPriority
  );

  // HIDDEN_VALUE is an additional flag on top of the urgent flag — both can apply.
  const flag = adjustment.hiddenValue && urgentFlag.flag === "NORMAL"
    ? "HIDDEN_VALUE"
    : urgentFlag.flag;

  const urgentNote = adjustment.hiddenValue && urgentFlag.note
    ? `HIDDEN VALUE: ${urgentFlag.note}`
    : adjustment.hiddenValue
      ? "HIDDEN VALUE: mundane item that may carry biological or trace evidence."
      : urgentFlag.note;

  return {
    item: description,
    matrixId: row.Item_ID || "UNASSIGNED",
    category: row.Evidence_Category || "",
    subType: row.Sub_Type || "",
    basePriority,
    finalPriority: adjustment.finalPriority,
    priorityLabel: getPriorityLabel(
      adjustment.finalPriority
    ),
    flag,
    urgent: urgentFlag.urgent || adjustment.hiddenValue,
    urgentNote,
    testingRequired:
      row.Testing_Type_Required || "Not specified",
    collectionMethod:
      row.Collection_Method || "Not specified",
    chainOfCustodySensitivity:
      row.Chain_of_Custody_Sensitivity || "Not specified",
    reason: buildReason(
      row,
      basePriority,
      adjustment.finalPriority,
      adjustment.reasons
    ),
    matchScore: Number(match.matchScore.toFixed(2)),
    matrixProbativeValue:
      row.Probative_Value || "",
    degradationSpeed:
      row.Degradation_Speed || "",
    automationFlagTrigger:
      row.Automation_Flag_Trigger || ""
  };
}

function buildSchedule(results) {
  const groups = {
    Immediate: [],
    "Same day": [],
    "Standard 48-72h": [],
    Batch: [],
    "No lab action": []
  };

  for (const result of results) {
    groups[result.priorityLabel].push(result);
  }

  return groups;
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "forensic-evidence-triage-backend",
    matrixRows: evidenceMatrix.length
  });
});

app.get("/api/matrix-info", (req, res) => {
  res.json({
    source:
      ".bob/skills/evidence-triage/evidence-priority-matrix.csv",
    rows: evidenceMatrix.length,
    columns: Object.keys(evidenceMatrix[0] || {})
  });
});

app.post("/api/triage", (req, res) => {
  try {
    const {
      caseId = "UNKNOWN",
      crimeType = "",
      evidenceItems = []
    } = req.body;

    if (!Array.isArray(evidenceItems)) {
      return res.status(400).json({
        error: "evidenceItems must be an array."
      });
    }

    const previousDescriptions = [];

    const results = evidenceItems.map((input) => {
      const normalizedInput = {
        ...input,
        crimeType
      };

      const result = processEvidenceItem(
        normalizedInput,
        previousDescriptions
      );

      previousDescriptions.push(
        normalizedInput.description || ""
      );

      return result;
    });

    results.sort((a, b) => {
      if (a.finalPriority !== b.finalPriority) {
        return b.finalPriority - a.finalPriority;
      }

      if (a.urgent !== b.urgent) {
        return a.urgent ? -1 : 1;
      }

      return b.matchScore - a.matchScore;
    });

    const rankedResults = results.map((result, index) => ({
      rank: index + 1,
      ...result
    }));

    const schedule = buildSchedule(rankedResults);

    res.json({
      success: true,
      // This triage engine directly implements the reasoning rules specified in:
      //   .bob/skills/evidence-triage/SKILL.md
      // and reads the authoritative evidence matrix from:
      //   .bob/skills/evidence-triage/evidence-priority-matrix.csv
      // IBM Bob was used to define, validate, and refine all triage rules.
      // The skill remains the authoritative specification; this backend is its
      // deterministic runtime implementation.
      engineSpec: "IBM_BOB_SKILL: .bob/skills/evidence-triage/SKILL.md",
      matrixSource: ".bob/skills/evidence-triage/evidence-priority-matrix.csv",

      caseSummary: {
        caseId,
        crimeType,
        evidenceCount: rankedResults.length
      },

      results: rankedResults,

      schedule,

      advisory:
        "Priorities are decision-support guidance only. Qualified forensic examiners and investigators make final decisions, and local SOPs take precedence."
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Evidence triage failed.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Forensic triage backend running on http://localhost:${PORT}`
  );
});