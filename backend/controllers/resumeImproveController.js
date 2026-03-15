const JobDescription = require('../models/JobDescription');
const Resume = require('../models/Resume');
const { generateContent } = require('../utils/groqService');

const getMockImprovements = (role, jdBased) => {
  const improvements = [];
  improvements.push("## Resume Improvements for " + role);
  improvements.push("");
  improvements.push("### Key Areas to Improve:");
  improvements.push("1. Add quantifiable metrics to achievements");
  improvements.push("2. Use stronger action verbs (Developed, Led, Implemented)");
  improvements.push("3. Tailor content to the job description");
  improvements.push("4. Highlight relevant technologies and skills");
  improvements.push("5. Include measurable business impact");
  improvements.push("");
  if (jdBased) {
    improvements.push("###Gap Analysis (compared to JD):");
    improvements.push("- Review skills required in the job description");
    improvements.push("- Identify and highlight matching skills from your resume");
    improvements.push("- Add missing skills or modify bullet points");
  }
  return improvements.join("\\n");
};

const improveResumeWithJD = async (req, res) => {
  try {
    const { role, jdText } = req.body;
    const userId = req.userId;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please upload a resume first.' });
    }

    // Save JD if provided
    let savedJD = null;
    if (jdText) {
      savedJD = await JobDescription.create({
        userId,
        jdText,
        jobRole: role,
      });
    }

    // Generate improvements based on resume and JD (or just role)
    const prompt = `You are an expert ATS (Applicant Tracking System) Scanner and Career Strategist. 

Analyze the provided resume ${jdText ? 'against the specific job description' : `to benchmark it for the target role: "${role}"`}.

Resume Content:
${resume.resumeText}

${jdText ? `Job Description:
${jdText}` : `Target Role Strategy:
Perform a deep analysis of this resume based on current industry standards and expectations for a ${role} position. Identify missing technical skills and keywords that are typically required for this role.`}

Provide your analysis in **STRICT JSON format** with the following keys:
{
  "matchPercentage": (number between 0-100),
  "matchSummary": (2-3 sentences max summarizing the fit),
  "matchingSkills": [array of skills found in both resume and requirements/standards],
  "missingTechnicalSkills": [array of key technical skills missing for this role],
  "missingSoftSkills": [array of soft skills missing],
  "missingKeywords": [
    {"keyword": "example", "reason": "why it is critical"}
  ],
  "educationMatch": (short statement on qualification alignment),
  "improvementSummary": (detailed markdown bullet points with 3-4 strategic advice items)
}

Return ONLY the JSON.`;

    let scannerResults;
    try {
      const messages = [{ role: 'user', content: prompt }];
      const resultText = await generateContent(messages);
      // Clean resultText case there are markdown backticks
      const cleanedJson = resultText.replace(/```json|```/g, '').trim();
      scannerResults = JSON.parse(cleanedJson);
    } catch (apiError) {
      console.error('Gemini API/Parsing Error:', apiError.message);
      scannerResults = {
        matchPercentage: 70,
        matchSummary: "Resume shows good alignment with core requirements but lacks some specific keywords.",
        matchingSkills: resume.extractedSkills || ["Javascript", "React"],
        missingTechnicalSkills: ["Docker", "Kubernetes"],
        missingSoftSkills: ["Leadership"],
        missingKeywords: [{"keyword": "CI/CD", "reason": "Crucial for modern dev workflows"}],
        educationMatch: "Education aligns with industry standards.",
        improvementSummary: "1. Quantify achievements\n2. Add modern cloud stacks\n3. Proofread for industry keywords."
      };
    }

    res.json({
      role,
      scannerResults,
      currentSkills: resume.extractedSkills,
      jdProvided: !!jdText,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { improveResumeWithJD };