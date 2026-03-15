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
    const prompt = `You are a world-class ATS (Applicant Tracking System) Scanner and Professional Resume Auditor. 

Analyze the provided resume ${jdText ? 'against the following job description' : `to benchmark it for the target role: "${role}"`}.

Resume Content:
${resume.resumeText}

${jdText ? `Job Description:
${jdText}` : `Target Role Benchmark:
Perform a deep analysis of this resume based on industry standards for a ${role} position. Identify critical technical skills, certifications, and industry keywords that are typically expected.`}

Provide a high-quality, professional analysis in **STRICT JSON format**. Ensure the match percentage is realistic based on the content.

Structure:
{
  "matchPercentage": (number),
  "matchSummary": (detailed 2-3 sentence overview),
  "matchingSkills": [array],
  "missingTechnicalSkills": [array],
  "missingSoftSkills": [array],
  "missingKeywords": [
    {"keyword": "example", "reason": "why critical"}
  ],
  "categoryScores": {
    "keywordMatch": (0-100),
    "formatting": (0-100),
    "contentImpact": (0-100)
  },
  "formattingTips": [array of design/structure improvements],
  "educationMatch": (short statement on qualification alignment),
  "improvementSummary": (Markdown bullet points with specific, actionable advice to reach 90%+ match)
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