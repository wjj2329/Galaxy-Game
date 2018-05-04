
import * as example from "../src/example";

test("full name", () => {
  expect(example.fullName("Alyssa", "Haroldsen")).toBe("Alyssa Haroldsen");
});
