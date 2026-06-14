import { PromptTemplate } from "@langchain/core/prompts";

export const summarizeJDPrompt = PromptTemplate.fromTemplate(`
You are an expert job analyst. Summarize the following job description into a structured format.

Job Description:
{jobDescription}

Return a JSON object with this exact structure:
{{
  "summary": "2-3 sentence overview of the role",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceLevel": "Entry | Mid | Senior | Lead",
  "salaryHint": "string or null if not mentioned"
}}

Return ONLY the JSON, no markdown formatting, no extra text.
`);

export const analyzeApplicationPrompt = PromptTemplate.fromTemplate(`
You are an expert career coach. Compare the following resume against the job description and analyze the fit.

Resume:
{resume}

Job Description:
{jobDescription}

Return a JSON object with this exact structure:
{{
  "matchScore": "number from 0 to 100",
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "suggestions": ["suggestion1", "suggestion2"]
}}

Return ONLY the JSON, no markdown formatting, no extra text.
`);

export const skillRoadmapPrompt = PromptTemplate.fromTemplate(`
You are a career development mentor. The user is missing the following skills for a job they want:

Missing Skills: {missingSkills}

For each skill, provide a learning roadmap.

Return a JSON object with this exact structure:
{{
  "roadmap": [
    {{
      "skill": "skill name",
      "priority": "High | Medium | Low",
      "estimatedTime": "e.g. 2 weeks",
      "resources": ["resource1", "resource2"],
      "steps": ["step1", "step2", "step3"]
    }}
  ]
}}

Return ONLY the JSON, no markdown formatting, no extra text.
`);

export const interviewQuestionsPrompt = PromptTemplate.fromTemplate(`
You are an interview preparation coach. Based on the resume and job description below, generate likely interview questions.

Resume:
{resume}

Job Description:
{jobDescription}

Return a JSON object with this exact structure:
{{
  "technicalQuestions": ["question1", "question2"],
  "behavioralQuestions": ["question1", "question2"],
  "roleSpecificQuestions": ["question1", "question2"],
  "tips": ["tip1", "tip2"]
}}

Return ONLY the JSON, no markdown formatting, no extra text.
`);

export const jobScamPrompt = PromptTemplate.fromTemplate(`
You are a job fraud detection expert. Analyze the following job posting for signs of being a scam.

Company: {company}
Job Link: {jobLink}
Job Description:
{jobDescription}

Look for red flags such as: requests for payment, unrealistic salary, vague job duties, urgency pressure, generic email domains, grammar issues, requests for personal/financial info upfront.

Return a JSON object with this exact structure:
{{
  "riskLevel": "Low | Medium | High",
  "riskScore": "number from 0 to 100",
  "redFlags": ["flag1", "flag2"],
  "reasoning": "2-3 sentence explanation",
  "recommendation": "what the user should do"
}}

Return ONLY the JSON, no markdown formatting, no extra text.
`);

export const applicationMessagePrompt = PromptTemplate.fromTemplate(`
You are a professional career communication expert. Write a {type} message for a job application.

Company: {company}
Role: {role}
Recipient Name: {recipientName}

Guidelines based on type:
- "linkedin": short, professional connection/outreach message (under 300 characters)
- "cold-email": formal email with subject line and body, expressing interest in the role
- "whatsapp": brief, friendly but professional message
- "referral": message asking a contact for a referral, polite and not pushy

Return only the message text, no extra commentary, no markdown formatting, no quotation marks around the message.
`);