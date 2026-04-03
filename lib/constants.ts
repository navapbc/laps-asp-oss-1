import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export type SuggestionItem = {
  title: string;
  description: string;
  prompt: string;
};

export const suggestions: SuggestionItem[] = [
  {
    title: "Start a SNAP application",
    description: "for a new SNAP application",
    prompt:
      "I need to complete a SNAP application for a client. Can you help me fill out the form?",
  },
  {
    title: "Multi-program enrollment",
    description: "across multiple programs",
    prompt:
      "I have a client who needs help with multiple benefit programs. Where should we start?",
  },
  {
    title: "Upload client documents",
    description: "to auto-fill client data",
    prompt:
      "I'd like to upload client documents so the assistant can pre-fill the application fields.",
  },
  {
    title: "Review an application",
    description: "for an existing application",
    prompt:
      "I have an in-progress application that needs to be reviewed and completed. Can you help?",
  },
];
