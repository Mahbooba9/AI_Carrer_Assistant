const { searchJobs } = require('../utils/jobFetcher');
const Resume = require('../models/Resume');

const searchJobsWithFilters = async (req, res) => {
  try {
    const {
      jobTitle,
      location = 'United States',
      salaryMin,
      salaryMax,
      experience,
      company,
      skills,
    } = req.body;
    const userId = req.userId;

    if (!jobTitle) {
      return res.status(400).json({ message: 'Job title is required' });
    }

    // Get user's resume to extract skills if not provided
    const resume = await Resume.findOne({ userId });
    let userSkills = skills || [];

    if (resume && !skills) {
      userSkills = resume.extractedSkills || [];
    }

    // Search jobs with filters
    const jobs = await searchJobs({
      jobTitle,
      location,
      salaryMin,
      salaryMax,
      experience,
      company,
    }, userSkills);

    res.json({
      jobs,
      userSkills,
      totalResults: jobs.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchJobsWithFilters };