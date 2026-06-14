import { Runnable } from "@langchain/core/runnables";
import { llm } from "../config/llm";
import {
    summarizeJDPrompt,
    analyzeApplicationPrompt,
    skillRoadmapPrompt,
    interviewQuestionsPrompt,
    jobScamPrompt,
    applicationMessagePrompt,
} from "./langchainPrompts";
import {
    jdSummaryParser,
    analyzeApplicationParser,
    skillRoadmapParser,
    interviewQuestionsParser,
    jobScamParser,
    applicationMessageParser,
} from "./langchainParsers";

export const summarizeJDChain: Runnable<{ jobDescription: string }, any> =
    summarizeJDPrompt.pipe(llm).pipe(jdSummaryParser);

export const analyzeApplicationChain: Runnable<{ resume: string; jobDescription: string }, any> =
    analyzeApplicationPrompt.pipe(llm).pipe(analyzeApplicationParser);

export const skillRoadmapChain: Runnable<{ missingSkills: string }, any> =
    skillRoadmapPrompt.pipe(llm).pipe(skillRoadmapParser);

export const interviewQuestionsChain: Runnable<{ resume: string; jobDescription: string }, any> =
    interviewQuestionsPrompt.pipe(llm).pipe(interviewQuestionsParser);

export const jobScamChain: Runnable<{ company: string; jobLink: string; jobDescription: string }, any> =
    jobScamPrompt.pipe(llm).pipe(jobScamParser);

export const applicationMessageChain: Runnable<{ type: string; company: string; role: string; recipientName: string }, string> =
    applicationMessagePrompt.pipe(llm).pipe(applicationMessageParser);