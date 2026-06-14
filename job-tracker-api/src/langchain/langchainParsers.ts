import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";

export const jdSummaryParser = new JsonOutputParser();
export const analyzeApplicationParser = new JsonOutputParser();
export const skillRoadmapParser = new JsonOutputParser();
export const interviewQuestionsParser = new JsonOutputParser();
export const jobScamParser = new JsonOutputParser();
export const applicationMessageParser = new StringOutputParser();