# Problem Statement

## Background

Forensic Science Laboratories (FSLs) and law enforcement agencies face severe backlogs globally. At major crime scenes, investigating officers routinely collect dozens to hundreds of physical, biological, trace, impression, and digital items. Under high-stress, fast-moving field conditions, the submission process to laboratories is primarily manual, linear, or determined ad-hoc based on individual officer intuition rather than standardized forensic degradation kinetics.

The danger of this gap was demonstrated during high-profile cases like the **2019 Hyderabad case**, where investigators sifted through over 3,000 photographs and 200+ physical items. Without automated, risk-adjusted triage, high-value trace evidence—such as a single DNA-bearing cigarette butt—was nearly overlooked in the initial processing pass, risking case outcomes and justice delivery.

## The Problem

At modern crime scenes, the rate of evidence collection drastically outpaces the processing throughput of regional forensic laboratories. When all seized items arrive at the lab simultaneously without intelligent prioritization:

1. **Vulnerable evidence degrades:** Biological fluids, touch DNA, volatile digital memory (RAM), and transient outdoor impressions (tire/shoe treads) degrade or are overwritten within hours.
2. **Backlogs compound:** Low-probative, slow-degrading items (e.g., standard documents, stable storage media) enter the lab queues ahead of volatile, time-sensitive evidentiary material.
3. **Chain-of-custody mistakes occur:** Field officers often lack instant, standardized collection and packaging guidance per evidence type, leading to contamination or improper preservation.

## Who is Affected

* **Investigative Officers & First Responders:** Field investigators who must make rapid decisions regarding what to preserve, package, and dispatch first without on-site forensic scientists.
* **Forensic Science Laboratories (FSLs):** Overburdened lab analysts who waste critical capacity sorting through improperly ranked, unclassified, or already degraded items.
* **Judicial System & Prosecutors:** Courts and prosecutors whose convictions hinge on high-integrity forensic reports that often arrive weeks or months after statutory deadlines.
* **Victims and Society:** Victims and families whose pursuit of justice is delayed or compromised because critical trace or DNA evidence degraded before testing.

## Why It Matters

* **Preserving Time-Critical Probative Value:** DNA degrades, outdoor impressions wash away, and unisolated digital devices get remotely wiped or locked out. Evidence triage is not administrative; it directly impacts whether perpetrators are identified.
* **Optimizing Public Resources:** Regional FSLs have limited instrumentation (e.g., GC-MS, STR profiling kits, Cellebrite systems). Intelligent batching ensures high-probative evidence reaches dedicated instruments first.
* **Ensuring Admissibility:** Proper field packaging protocols (e.g., paper packaging for biologicals vs. airtight containers for accelerants vs. Faraday bags for mobile devices) maintain evidence integrity from scene to court.

## Why Existing Solutions Fall Short

1. **Static, Paper-Based Checklists:** Existing standard operating procedures (SOPs) are voluminous manual documents that field investigators cannot feasibly cross-reference while processing a chaotic scene.
2. **Lack of Dynamic Contextual Reasoning:** Legacy laboratory management databases (LIMS) record items *after* intake, rather than acting at the point of recovery. They treat evidence as static inventory rather than evaluating environmental risks (e.g., rain on soil tracks, active laptop sessions, or wet biological stains).
3. **High Latency & Expensive AI Tools:** Many modern tech proposals assume heavy compute pipelines, cloud dependencies, or costly fine-tuned models that are slow, fail offline, and consume unsustainable API budgets.
4. **Disconnection from Forensic Science:** Generic AI chatbots lack domain guardrails and tend to hallucinate legal and chain-of-custody protocols.

**Triage.AI** bridges this divide by combining an authoritative forensic prioritization matrix with an agentic, zero-shot inference pipeline—delivering deterministic, explainable, and resource-efficient evidence ranking in seconds.
