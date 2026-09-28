import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Scoring Engine 
function processEvidenceItems(rawItems, crimeContext) {
  const triaged = rawItems.map((item) => {
    const desc = (item.description || '').toLowerCase();
    
    let category = "Trace Evidence";
    let priorityScore = 55;
    let perishable = false;
    let urgencyTag = "ROUTINE QUEUE";
    let targetLab = "General Physical Lab";
    let reasoning = "Standard physical item processed for associative value under routine timeline.";

    // Biological / DNA Detection
    if (desc.includes("cigarette") || desc.includes("blood") || desc.includes("swab") || desc.includes("dna") || desc.includes("saliva") || desc.includes("hair")) {
      category = "Biological / DNA";
      priorityScore = 96;
      perishable = true;
      urgencyTag = "CRITICAL: PERISHABLE DNA";
      targetLab = "DNA Profiling Bureau";
      reasoning = "Unpreserved biological material exposed to environmental decay. High risk of nucleolytic breakdown. Immediate refrigeration required.";
    } 
    // Digital Forensics
    else if (desc.includes("dvr") || desc.includes("hard drive") || desc.includes("cctv") || desc.includes("phone") || desc.includes("laptop") || desc.includes("drive")) {
      category = "Digital Forensics";
      priorityScore = 88;
      perishable = false;
      urgencyTag = "PRIORITY 2: TIMELINE AUDIT";
      targetLab = "Cyber Forensics Lab";
      reasoning = "High probative value for establishing suspect route and timestamp confirmation.";
    } 
    // Latent Prints
    else if (desc.includes("bottle") || desc.includes("glass") || desc.includes("fingerprint") || desc.includes("print")) {
      category = "Latent Prints";
      priorityScore = 74;
      perishable = false;
      urgencyTag = "STANDARD LATENT SWEEP";
      targetLab = "Fingerprint Bureau";
      reasoning = "Smooth surface holds latent ridge impressions. Standard laboratory queue.";
    }
    // Thermal Receipt / Questioned Documents
    else if (desc.includes("receipt") || desc.includes("paper") || desc.includes("document")) {
      category = "Document Examination";
      priorityScore = 52;
      perishable = desc.includes("thermal");
      urgencyTag = perishable ? "HEAT SENSITIVE" : "ROUTINE QUEUE";
      targetLab = "Questioned Documents Unit";
      reasoning = "Thermal print text fades under ambient heat/light exposure.";
    }

    return {
      item_id: item.item_id || `EV-${Math.floor(1000 + Math.random() * 9000)}`,
      description: item.description,
      location: item.found_location || item.location || "Crime Scene Sector 1",
      category,
      priorityScore,
      perishable,
      urgencyTag,
      fslLab: targetLab,
      reasoning,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  // Sort descending by priority score
  triaged.sort((a, b) => b.priorityScore - a.priorityScore);

  // Assign ranks
  triaged.forEach((item, index) => {
    item.rank = index + 1;
  });

  return {
    case_id: crimeContext?.case_id || "HYD-2019-CR8921",
    total_items_processed: triaged.length,
    urgent_alerts_count: triaged.filter(i => i.perishable).length,
    evidence_queue: triaged
  };
}

// POST Endpoint for Evidence Triage
app.post('/api/triage', (req, res) => {
  try {
    const { raw_evidence_items, crime_context } = req.body;

    // Return cached dataset if request payload is empty
    if (!raw_evidence_items || !Array.isArray(raw_evidence_items) || raw_evidence_items.length === 0) {
      if (fs.existsSync('./cached_bob_response.json')) {
        const cachedData = JSON.parse(fs.readFileSync('./cached_bob_response.json', 'utf8'));
        return res.status(200).json({
          success: true,
          source: "CACHED_LOCAL_DB",
          data: cachedData
        });
      }
    }

    // Process using engine logic
    const processedData = processEvidenceItems(raw_evidence_items, crime_context);

    return res.status(200).json({
      success: true,
      source: "IBM_BOB_LOCAL_ENGINE",
      timestamp: new Date().toISOString(),
      data: processedData
    });

  } catch (err) {
    console.error("Backend Processing Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Forensic-prioritisation AI - Backend Active`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Endpoint:  POST http://localhost:${PORT}/api/triage`);
  console.log(`=================================================`);
});
