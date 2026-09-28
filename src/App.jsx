import { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Activity,
  FileSearch,
  Clock,
  Check,
  RotateCcw,
  FlaskConical,
  ShieldAlert,
} from "lucide-react";
import "./App.css";

const crimeTypes = [
  "Murder",
  "Burglary",
  "Arson",
  "Sexual Assault",
  "Hit and Run",
  "Cybercrime",
];

const conditionOptions = [
  "Stable / Protected",
  "Exposed",
  "Wet / Moist",
  "Heat Damaged",
  "Partially Damaged",
  "Unknown",
];

const initialEvidence = [
  {
    id: 1,
    description: "Half-burnt cigarette butt recovered near victim vehicle",
    location: "Sector 3 Dirt Path",
    condition: "Exposed",
    timeSinceRecovery: "6 hours",
  },
  {
    id: 2,
    description: "Highway Toll Plaza CCTV DVR Hard Drive",
    location: "Control Office B",
    condition: "Stable / Protected",
    timeSinceRecovery: "2 hours",
  },
];

const mockResults = [
  {
    rank: 1,
    matrixId: "EVID-038",
    priority: 5,
    group: "Immediate",
    category: "Biological",
    description:
      "Half-burnt cigarette butt recovered near victim vehicle",
    location: "Sector 3 Dirt Path",
    condition: "Exposed",
    urgency: "URGENT",
    flag: "HIDDEN VALUE",
    lab: "DNA / Biological Examination",
    testing: "DNA profiling; biological screening",
    preservation: "Immediate preservation",
    reasoning:
      "A cigarette butt may appear routine but can carry saliva or other biological material. Because it was recovered in a violent-crime context and is environmentally exposed, its evidentiary value may decrease with delay.",
    handling:
      "Handle with clean gloves, avoid touching the mouthpiece, air-dry if wet, and package according to applicable biological evidence procedures.",
  },
  {
    rank: 2,
    matrixId: "EVID-053",
    priority: 5,
    group: "Immediate",
    category: "Digital",
    description: "Highway Toll Plaza CCTV DVR Hard Drive",
    location: "Control Office B",
    condition: "Stable / Protected",
    urgency: "URGENT",
    flag: "AUTO_ESCALATE_URGENT",
    lab: "Digital Forensics Laboratory",
    testing: "Forensic imaging and video examination",
    preservation: "Immediate digital preservation",
    reasoning:
      "Digital video may contain time-sensitive information and can be affected by overwrite or improper handling. The device should be preserved before routine access or examination.",
    handling:
      "Maintain chain of custody and use appropriate forensic acquisition procedures. Do not browse or alter the original media.",
  },
  {
    rank: 3,
    matrixId: "EVID-026",
    priority: 4,
    group: "Same Day",
    category: "Impression",
    description: "Partial footprint recovered in mud",
    location: "Rear garden",
    condition: "Wet / Moist",
    urgency: "HIGH",
    flag: "AUTO_ESCALATE_URGENT",
    lab: "Impression Evidence Laboratory",
    testing: "Footwear impression examination",
    preservation: "Same-day documentation and preservation",
    reasoning:
      "A mud impression can deteriorate through drying, disturbance or environmental exposure. Documentation and preservation should occur promptly.",
    handling:
      "Photograph with scale before collection or casting. Protect the impression from further disturbance and follow applicable casting procedures.",
  },
  {
    rank: 4,
    matrixId: "EVID-063",
    priority: 3,
    group: "Standard — 48–72 Hours",
    category: "Trace / Biological",
    description: "Blood-stained clothing",
    location: "Bedroom floor",
    condition: "Stable / Protected",
    urgency: "STANDARD",
    flag: "AUTO_ESCALATE_LAB",
    lab: "Biological Examination Laboratory",
    testing: "DNA examination and biological screening",
    preservation: "Controlled storage",
    reasoning:
      "Blood-stained clothing may provide biological evidence and should be preserved appropriately. Under controlled conditions it can enter the standard examination queue.",
    handling:
      "Package biological material appropriately and maintain chain of custody. Avoid unnecessary handling or contamination.",
  },
  {
    rank: 5,
    matrixId: "EVID-031",
    priority: 3,
    group: "Standard — 48–72 Hours",
    category: "Trace",
    description: "Torn cloth recovered from fence",
    location: "Perimeter fence",
    condition: "Stable / Protected",
    urgency: "STANDARD",
    flag: "NONE",
    lab: "Trace Evidence Laboratory",
    testing: "Fiber and trace comparison",
    preservation: "Standard evidence storage",
    reasoning:
      "The fabric may provide associative trace evidence. It should be preserved without unnecessary handling and examined within the standard queue.",
    handling:
      "Package separately to prevent transfer of fibers or other trace material.",
  },
  {
    rank: 6,
    matrixId: "EVID-068",
    priority: 2,
    group: "Batch",
    category: "Documentary",
    description: "Insurance papers recovered from scene",
    location: "Office desk",
    condition: "Stable / Protected",
    urgency: "ROUTINE",
    flag: "NONE",
    lab: "Document Examination",
    testing: "Document examination if required",
    preservation: "Standard document storage",
    reasoning:
      "The item is primarily contextual and does not normally require immediate laboratory processing unless additional investigative information indicates otherwise.",
    handling:
      "Maintain document integrity and chain of custody.",
  },
];

const analysisSteps = [
  "Reading case context",
  "Classifying evidence",
  "Evaluating urgency",
  "Building FSL priority queue",
];

const priorityGroups = [
  {
    priority: 5,
    title: "Immediate",
    subtitle: "Priority 5",
    description: "Case-critical and time-degradable evidence",
    className: "priority-immediate",
  },
  {
    priority: 4,
    title: "Same Day",
    subtitle: "Priority 4",
    description: "Case-critical evidence requiring prompt examination",
    className: "priority-sameday",
  },
  {
    priority: 3,
    title: "Standard — 48–72 Hours",
    subtitle: "Priority 3",
    description: "Corroborating evidence for standard examination",
    className: "priority-standard",
  },
  {
    priority: 2,
    title: "Batch",
    subtitle: "Priority 2",
    description: "Contextual evidence suitable for batch processing",
    className: "priority-batch",
  },
  {
    priority: 1,
    title: "No Lab Action",
    subtitle: "Priority 1",
    description: "Investigative aid with no immediate laboratory action",
    className: "priority-none",
  },
];

function App() {
  const [caseId, setCaseId] = useState("HYD-2019-CR8921");
  const [crimeType, setCrimeType] = useState("Murder");

  const [evidence, setEvidence] = useState(initialEvidence);

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("Stable / Protected");
  const [timeSinceRecovery, setTimeSinceRecovery] = useState("");

  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [analysing, setAnalysing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const [caseStatus, setCaseStatus] = useState("READY");
  const [caseStatusText, setCaseStatusText] = useState(
    "Awaiting evidence analysis"
  );

  useEffect(() => {
    if (!analysing) {
      return;
    }

    setAnalysisStep(0);

    const timers = [
      setTimeout(() => setAnalysisStep(1), 650),
      setTimeout(() => setAnalysisStep(2), 1300),
      setTimeout(() => setAnalysisStep(3), 1950),
      setTimeout(() => {
        setResults(mockResults);
        setAnalysing(false);
        setCaseStatus("COMPLETE");
        setCaseStatusText("Priority queue generated");
      }, 2700),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [analysing]);

  function addEvidence() {
    if (description.trim() === "") {
      return;
    }

    const newEvidence = {
      id: Date.now(),
      description: description.trim(),
      location: location.trim() || "Location not specified",
      condition,
      timeSinceRecovery: timeSinceRecovery.trim() || "Not specified",
    };

    setEvidence([...evidence, newEvidence]);

    setDescription("");
    setLocation("");
    setCondition("Stable / Protected");
    setTimeSinceRecovery("");
  }

  function removeEvidence(id) {
    setEvidence(evidence.filter((item) => item.id !== id));
  }

  function analyseEvidence() {
    if (evidence.length === 0) {
      return;
    }

    setResults([]);
    setExpanded(null);
    setAnalysing(true);
    setCaseStatus("ANALYSING");
    setCaseStatusText("Evaluating evidence");
  }

  function toggleReasoning(rank) {
    if (expanded === rank) {
      setExpanded(null);
    } else {
      setExpanded(rank);
    }
  }

  function resetAnalysis() {
    setResults([]);
    setExpanded(null);
    setCaseStatus("READY");
    setCaseStatusText("Awaiting evidence analysis");
  }

  function getResultsForPriority(priority) {
    return results.filter((item) => item.priority === priority);
  }

  const urgentCount = results.filter(
    (item) => item.priority === 5 || item.urgency === "URGENT"
  ).length;

  const sameDayCount = results.filter(
    (item) => item.priority === 4
  ).length;

  const standardCount = results.filter(
    (item) => item.priority === 3
  ).length;

  const batchCount = results.filter(
    (item) => item.priority === 2
  ).length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Shield size={23} />
          </div>

          <div>
            <h1>FORENSIC TRIAGE</h1>
            <span>Evidence Prioritisation System</span>
          </div>
        </div>

        <div className="bob-status">
          <span className="status-dot"></span>
          <span>IBM BOB</span>
          <small>DECISION SUPPORT</small>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero-section">
          <div>
            <div className="eyebrow">
              <Activity size={14} />
              FORENSIC OPERATIONS
            </div>

            <h2>
              Prioritise evidence.
              <br />
              <span>Accelerate examination.</span>
            </h2>

            <p>
              AI-assisted evidence triage for investigators and forensic
              laboratories.
            </p>
          </div>

          <div className={`hero-stat status-${caseStatus.toLowerCase()}`}>
            <span>CASE STATUS</span>

            <strong>
              {caseStatus === "READY"
                ? "READY FOR TRIAGE"
                : caseStatus === "ANALYSING"
                  ? "ANALYSIS IN PROGRESS"
                  : "TRIAGE COMPLETE"}
            </strong>

            <small>{caseStatusText}</small>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-number">01</span>

              <div>
                <h3>Case Information</h3>
                <p>Define the investigation context</p>
              </div>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>CASE ID</span>

              <input
                type="text"
                value={caseId}
                onChange={(event) => setCaseId(event.target.value)}
                placeholder="Enter case ID"
              />
            </label>

            <label className="field">
              <span>CRIME TYPE</span>

              <select
                value={crimeType}
                onChange={(event) => setCrimeType(event.target.value)}
              >
                {crimeTypes.map((crime) => (
                  <option key={crime} value={crime}>
                    {crime}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-number">02</span>

              <div>
                <h3>Evidence Collection</h3>
                <p>Add every relevant item recovered from the scene</p>
              </div>
            </div>

            <div className="evidence-count">
              {evidence.length} ITEMS
            </div>
          </div>

          <div className="evidence-input">
            <div className="input-row">
              <label className="field">
                <span>DESCRIPTION</span>

                <input
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the evidence item"
                />
              </label>

              <label className="field">
                <span>LOCATION FOUND</span>

                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Where was it found?"
                />
              </label>

              <button
                type="button"
                className="add-button"
                onClick={addEvidence}
              >
                <Plus size={18} />
                ADD
              </button>
            </div>

            <div className="input-row-secondary">
              <label className="field">
                <span>CONDITION</span>

                <select
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                >
                  {conditionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>TIME SINCE RECOVERY</span>

                <div className="time-input">
                  <Clock size={15} />

                  <input
                    type="text"
                    value={timeSinceRecovery}
                    onChange={(event) =>
                      setTimeSinceRecovery(event.target.value)
                    }
                    placeholder="e.g. 6 hours"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="evidence-list">
            {evidence.length === 0 ? (
              <div className="empty-evidence">
                <FileSearch size={25} />

                <strong>No evidence items added</strong>

                <span>
                  Add recovered evidence above to begin triage.
                </span>
              </div>
            ) : (
              evidence.map((item, index) => (
                <div className="evidence-item" key={item.id}>
                  <div className="evidence-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="evidence-info">
                    <strong>{item.description}</strong>

                    <div className="evidence-details">
                      <span>
                        <MapPin size={13} />
                        {item.location}
                      </span>

                      <span>
                        <AlertTriangle size={13} />
                        {item.condition}
                      </span>

                      <span>
                        <Clock size={13} />
                        {item.timeSinceRecovery}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => removeEvidence(item.id)}
                    title="Remove evidence"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="analyse-button"
            onClick={analyseEvidence}
            disabled={analysing || evidence.length === 0}
          >
            {analysing ? (
              <>
                <span className="spinner"></span>
                ANALYSING EVIDENCE...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                ANALYSE & PRIORITISE EVIDENCE
              </>
            )}
          </button>
        </section>

        {analysing && (
          <section className="analysis-panel">
            <div className="analysis-header">
              <div className="analysis-icon">
                <Sparkles size={21} />
              </div>

              <div>
                <div className="eyebrow">
                  <Activity size={14} />
                  FORENSIC ANALYSIS
                </div>

                <h2>Evaluating evidence</h2>

                <p>
                  Structuring the case and preparing an examination
                  priority queue.
                </p>
              </div>
            </div>

            <div className="analysis-progress">
              {analysisSteps.map((step, index) => {
                const completed = index < analysisStep;
                const active = index === analysisStep;

                return (
                  <div
                    className={`analysis-step ${
                      completed ? "completed" : ""
                    } ${active ? "active" : ""}`}
                    key={step}
                  >
                    <div className="step-indicator">
                      {completed ? (
                        <Check size={13} />
                      ) : active ? (
                        <span className="step-spinner"></span>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    <span>{step}</span>
                  </div>
                );
              })}
            </div>

            <div className="analysis-bar">
              <div
                className="analysis-bar-fill"
                style={{
                  width: `${Math.min(
                    ((analysisStep + 1) / analysisSteps.length) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>

            <div className="analysis-footer">
              <span>IBM BOB • DECISION SUPPORT ENGINE</span>

              <span>
                STEP {Math.min(analysisStep + 1, analysisSteps.length)} OF{" "}
                {analysisSteps.length}
              </span>
            </div>
          </section>
        )}

        {results.length > 0 && (
          <section className="results-section">
            <div className="results-heading">
              <div>
                <div className="eyebrow">
                  <FileSearch size={14} />
                  TRIAGE COMPLETE
                </div>

                <h2>Evidence Examination Queue</h2>

                <p>
                  Ranked using the forensic priority framework and
                  examination urgency.
                </p>
              </div>

              <div className="result-summary">
                <div>
                  <strong>{results.length}</strong>
                  <span>ITEMS</span>
                </div>

                <div className="critical-summary">
                  <strong>{urgentCount}</strong>
                  <span>URGENT</span>
                </div>
              </div>
            </div>

            <div className="priority-overview">
              <div className="priority-stat immediate-stat">
                <strong>{urgentCount}</strong>
                <span>IMMEDIATE</span>
                <small>Priority 5</small>
              </div>

              <div className="priority-stat">
                <strong>{sameDayCount}</strong>
                <span>SAME DAY</span>
                <small>Priority 4</small>
              </div>

              <div className="priority-stat">
                <strong>{standardCount}</strong>
                <span>STANDARD</span>
                <small>Priority 3</small>
              </div>

              <div className="priority-stat">
                <strong>{batchCount}</strong>
                <span>BATCH</span>
                <small>Priority 2</small>
              </div>
            </div>

            <div className="priority-groups">
              {priorityGroups.map((group) => {
                const groupItems = getResultsForPriority(group.priority);

                if (groupItems.length === 0) {
                  return null;
                }

                return (
                  <div
                    className={`priority-group ${group.className}`}
                    key={group.priority}
                  >
                    <div className="priority-group-header">
                      <div className="priority-group-title">
                        <div className="priority-number">
                          {group.priority}
                        </div>

                        <div>
                          <h3>{group.title}</h3>
                          <span>{group.subtitle}</span>
                        </div>
                      </div>

                      <div className="priority-group-description">
                        {group.description}
                      </div>

                      <div className="priority-group-count">
                        {groupItems.length}
                        <span>ITEM{groupItems.length !== 1 ? "S" : ""}</span>
                      </div>
                    </div>

                    <div className="results-list">
                      {groupItems.map((item) => (
                        <article
                          className={`result-card ${
                            item.priority === 5 ? "critical-card" : ""
                          }`}
                          key={item.rank}
                        >
                          <div className="rank">
                            <span>RANK</span>
                            <strong>#{item.rank}</strong>
                          </div>

                          <div className="result-main">
                            <div className="result-topline">
                              <span className="category">
                                {item.category}
                              </span>

                              <span
                                className={`urgency urgency-${item.urgency.toLowerCase()}`}
                              >
                                {(item.urgency === "URGENT" ||
                                  item.flag !== "NONE") && (
                                  <AlertTriangle size={13} />
                                )}

                                {item.urgency}
                              </span>
                            </div>

                            <h3>{item.description}</h3>

                            <div className="result-location">
                              <MapPin size={14} />
                              {item.location}
                            </div>

                            <div className="forensic-meta">
                              <div>
                                <span>MATRIX ID</span>
                                <strong>{item.matrixId}</strong>
                              </div>

                              <div>
                                <span>PRIORITY</span>
                                <strong className="priority-score">
                                  {item.priority}/5
                                </strong>
                              </div>

                              <div>
                                <span>FSL DESTINATION</span>
                                <strong>{item.lab}</strong>
                              </div>
                            </div>

                            <div className="testing-row">
                              <div>
                                <FlaskConical size={14} />

                                <div>
                                  <span>TESTING REQUIRED</span>
                                  <strong>{item.testing}</strong>
                                </div>
                              </div>

                              <div>
                                <ShieldAlert size={14} />

                                <div>
                                  <span>PRESERVATION</span>
                                  <strong>{item.preservation}</strong>
                                </div>
                              </div>
                            </div>

                            {item.flag !== "NONE" && (
                              <div className="flag-row">
                                <AlertTriangle size={14} />

                                <div>
                                  <span>AUTOMATION / VALUE FLAG</span>
                                  <strong>{item.flag}</strong>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              className="reason-button"
                              onClick={() => toggleReasoning(item.rank)}
                            >
                              <Search size={14} />

                              View forensic reasoning

                              {expanded === item.rank ? (
                                <ChevronUp size={15} />
                              ) : (
                                <ChevronDown size={15} />
                              )}
                            </button>

                            {expanded === item.rank && (
                              <div className="reasoning">
                                <span>TRIAGE REASONING</span>

                                <p>{item.reasoning}</p>

                                <div className="handling-note">
                                  <strong>HANDLING NOTE</strong>
                                  <p>{item.handling}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="schedule-panel">
              <div className="schedule-header">
                <div>
                  <div className="eyebrow">
                    <FlaskConical size={14} />
                    FSL EXAMINATION SCHEDULE
                  </div>

                  <h2>Recommended examination sequence</h2>
                </div>
              </div>

              <div className="schedule-list">
                {priorityGroups.map((group) => {
                  const groupItems = getResultsForPriority(group.priority);

                  if (groupItems.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      className="schedule-row"
                      key={`schedule-${group.priority}`}
                    >
                      <div className="schedule-priority">
                        <strong>{group.priority}</strong>
                      </div>

                      <div className="schedule-content">
                        <strong>{group.title}</strong>

                        <span>
                          {groupItems
                            .map((item) => item.description)
                            .join(" • ")}
                        </span>
                      </div>

                      <div className="schedule-action">
                        {group.priority === 5
                          ? "ALERT LAB / ON-CALL EXAMINER"
                          : group.priority === 4
                            ? "SAME-DAY EXAMINATION"
                            : group.priority === 3
                              ? "STANDARD QUEUE"
                              : "BATCH PROCESSING"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="limits-panel">
              <AlertTriangle size={16} />

              <div>
                <strong>ADVISORY</strong>

                <p>
                  Priority assignments are decision-support guidance based
                  on the available case information. Qualified forensic
                  personnel and applicable local SOPs remain authoritative.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="reset-analysis-button"
              onClick={resetAnalysis}
            >
              <RotateCcw size={15} />
              RUN NEW TRIAGE
            </button>
          </section>
        )}

        <section className="bob-panel">
          <div className="bob-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <span>IBM BOB • AI DECISION SUPPORT</span>

            <p>
              This system assists investigators by structuring evidence,
              identifying time-sensitive items and generating an examination
              priority queue. Final forensic decisions remain with qualified
              personnel and applicable SOPs.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <span>FORENSIC TRIAGE SYSTEM</span>

        <span>
          DECISION SUPPORT • NOT A SUBSTITUTE FOR FORENSIC EXPERTISE
        </span>
      </footer>
    </div>
  );
}

export default App;