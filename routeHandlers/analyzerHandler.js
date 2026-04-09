const express = require('express');
const router = express.Router();
const { getCVText, setCVText } = require('../pdfHandlers/cvStore');
const {extractCV} = require('../pdfHandlers/pdfParser');
const { GoogleGenAI } = require('@google/genai');
const { parse } = require('dotenv');
const multer = require('multer');
const path = require('path');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..')); // save in project folder
    },
    filename: function (req, file, cb) {
        cb(null, 'resume.pdf'); // always save uploaded CV as resume.pdf
    }
});

const upload = multer({ storage: storage });

// Serve HTML form
router.get('/apply', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});


router.post('/analyze', upload.single('cvFile'), async (req, res)=>{
    try {
        if (!req.file) return res.status(400).send('No CV uploaded');

        const cvText = await extractCV('./resume.pdf');
        setCVText(cvText);
        console.log('CV loaded successfully');

        const cv = getCVText();

        const cleanedBody = Object.fromEntries(
            Object.entries(req.body).map(([key, value]) => [
                key,
                typeof value === 'string'
                ? value.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
                : value // leave files or other types untouched
            ])
            );

        const prompt = `
        You are an expert career coach, ATS (Applicant Tracking System) optimizer, and technical recruiter.

        I will provide you with the following inputs:

        - CV: {${cv}}
        - Job Role: {${cleanedBody.JOB_ROLE}}
        - Job Description: {${cleanedBody.JOB_DESCRIPTION}}
        - Job Responsibilites: {${cleanedBody.JOB_RESPONSIBILITIES}}
        - Application Deadline: {${cleanedBody.DEADLINE}}
        - Required Skills: {${cleanedBody.REQUIRED_SKILLS}}
        - Experience Required: {${cleanedBody.EXPERIENCE_WANTED}}
        - Special Notes: {${cleanedBody.SPECIAL_NOTES}}

        Task:

        1. Optimize the CV for the given job role and description:
        - Make it ATS-friendly with proper keywords and bullet points
        - Improve clarity, impact, and professionalism
        - Highlight relevant experience and quantify achievements

        2. ATS Analysis:
        - Provide ATS score (out of 100)
        - List missing keywords

        3. Job Fit:
        - Provide match percentage
        - List strengths and gaps

        4. Skills Gap:
        - Identify missing skills
        - Suggest prioritized skills to learn

        5. Learning Resources:
        - Suggest YouTube topics/videos for each skill

        6. Suggestions:
        - Give actionable tips (projects, portfolio, certifications)

        Output JSON format:

        {
        "ats_score": number,
        "places_to_upgrade_in_cv": ["..."]
        "missing_keywords": ["..."],
        "job_match_percentage": number,
        "strengths": ["..."],
        "gaps": ["..."],
        "skills_to_learn": ["..."],
        "learning_resources": [
            {
            "skill": "...",
            "resources": ["..."]
            }
        ],
        "suggestions": ["..."]
        }

        Rules:
        - Keep it concise and professional
        - Return ONLY valid JSON. Do not stringify. Do not add backticks or explanations.`


        if(!prompt){
            return res.status(400).json({
                success: false,
                message: "Promt is required",
            })
        }
        
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL,
            contents: prompt,
        });

        const text = response.candidates[0].content;
        const reply = text.parts[0].text;

        const parsed = JSON.parse(reply);
        console.log(parsed);

        res.status(200).json({
            success: true,
            reply: parsed,
            //result: text,
            message: "Success"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Something Went Wrong",
        })
    }
})


module.exports = router;