import { describe, expect, it } from "vitest";
import type { DbWordAttempt } from "@/lib/api";
import { mockCoaching } from "@/lib/mocks";
import { parseStoredCoaching } from "@/lib/sessionRecovery";

const attempt = (coachingResponse: DbWordAttempt["coaching_response"]): DbWordAttempt => ({
  id: "attempt-1",
  session_id: "session-1",
  target_word: "expostulate",
  child_attempt: "expastuate",
  is_correct: false,
  coaching_response: coachingResponse,
  created_at: "2026-08-13T09:32:16.927082+00:00",
});

describe("stored session coaching recovery", () => {
  it("uses a JSON coaching object returned by Supabase", () => {
    const coaching = mockCoaching({
      targetWord: "expostulate",
      childAttempt: "expastuate",
      level: 3,
      mode: "standard",
      definitionViewed: false,
      exampleViewed: false,
      originViewed: false,
      partOfSpeechViewed: false,
      repeatWordCount: 0,
      usedVoiceInput: false,
    });

    expect(parseStoredCoaching(attempt(coaching))).toBe(coaching);
  });

  it("continues to support legacy JSON strings and plain text", () => {
    const coaching = mockCoaching({
      targetWord: "expostulate",
      childAttempt: "expastuate",
      level: 3,
      mode: "standard",
      definitionViewed: false,
      exampleViewed: false,
      originViewed: false,
      partOfSpeechViewed: false,
      repeatWordCount: 0,
      usedVoiceInput: false,
    });

    expect(parseStoredCoaching(attempt(JSON.stringify(coaching)))).toEqual(coaching);
    expect(parseStoredCoaching(attempt("legacy feedback")).coachingText.shortFeedback)
      .toBe("legacy feedback");
  });
});
