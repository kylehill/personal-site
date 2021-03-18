import {
  reducerFunction,
  initializer,
  SwissDrawTreeAction,
  Tiebreak,
} from "components/SwissDrawTree/reducer";

describe("SwissDrawTree reducer", () => {
  describe("type: change_participants", () => {
    it("updates participants", () => {
      const state = initializer(32);
      const action: SwissDrawTreeAction = { type: "change_participants", participant_input: "36" };
      const newState = reducerFunction(state, action);
      expect(newState.options.participants).toEqual(36);
      expect(newState.current.tranches).toEqual([36]);
      expect(newState.options.valid).toEqual(true);
    });

    it("resets current", () => {
      const state = initializer();
      state.current = {
        round: 2,
        tranches: [16, 16],
        prior: [[32]],
      };
      const action: SwissDrawTreeAction = { type: "change_participants", participant_input: "36" };
      const newState = reducerFunction(state, action);
      expect(newState.current.round).toEqual(1);
    });

    it("fails gracefully for 0 or negative input", () => {
      const state = initializer();

      expect(
        reducerFunction(state, {
          type: "change_participants",
          participant_input: "0",
        }).options.valid
      ).toEqual(false);
      expect(
        reducerFunction(state, {
          type: "change_participants",
          participant_input: "-5",
        }).options.valid
      ).toEqual(false);
      expect(
        reducerFunction(state, {
          type: "change_participants",
          participant_input: "",
        }).options.valid
      ).toEqual(false);
      expect(
        reducerFunction(state, {
          type: "change_participants",
          participant_input: "text",
        }).options.valid
      ).toEqual(false);
    });
  });

  describe("type: change_tiebreak", () => {
    it("updates tiebreak", () => {
      const state = initializer(32);
      const action: SwissDrawTreeAction = { type: "change_tiebreak", tiebreak: Tiebreak.BestCase };
      const newState = reducerFunction(state, action);
      expect(newState.options.tiebreak).toEqual(Tiebreak.BestCase);
    });

    it("resets current", () => {
      const state = initializer(32);
      state.current = {
        round: 2,
        tranches: [16, 16],
        prior: [[32]],
      };
      const action: SwissDrawTreeAction = { type: "change_tiebreak", tiebreak: Tiebreak.BestCase };
      const newState = reducerFunction(state, action);
      expect(newState.current.round).toEqual(1);
    });
  });

  describe("type: increment_round", () => {
    it("increments from the first round", () => {
      const state = initializer(32);
      const action: SwissDrawTreeAction = { type: "increment_round" };
      const newState = reducerFunction(state, action);
      expect(newState.current).toEqual({
        round: 2,
        tranches: [16, 16],
        prior: [[32]],
      });

      const nextState = reducerFunction(newState, action);
      expect(nextState.current).toEqual({
        round: 3,
        tranches: [8, 16, 8],
        prior: [[32], [16, 16]],
      });
    });

    it("backloads byes into the final tranche", () => {
      const state = initializer(7);
      const action: SwissDrawTreeAction = { type: "increment_round" };
      const newState = reducerFunction(state, action);
      expect(newState.current).toEqual({
        round: 2,
        tranches: [4, 3],
        prior: [[7]],
      });

      const nextState = reducerFunction(newState, action);
      expect(nextState.current).toEqual({
        round: 3,
        tranches: [2, 4, 1],
        prior: [[7], [4, 3]],
      });

      const finalState = reducerFunction(nextState, action);
      expect(finalState.current).toEqual({
        round: 4,
        tranches: [1, 3, 3, 0],
        prior: [[7], [4, 3], [2, 4, 1]],
      });
    });

    it("deals with BestCase tiebreakers", () => {
      const state = initializer(14);
      state.options.tiebreak = Tiebreak.BestCase;

      const action: SwissDrawTreeAction = { type: "increment_round" };
      // apply twice to get to round 3
      const newState = reducerFunction(reducerFunction(state, action), action);
      expect(newState.current.tranches).toEqual([4, 6, 4]);
    });

    it("deals with WorstCase tiebreakers", () => {
      const state = initializer(14);
      state.options.tiebreak = Tiebreak.WorstCase;

      const action: SwissDrawTreeAction = { type: "increment_round" };
      // apply twice to get to round 3
      const newState = reducerFunction(reducerFunction(state, action), action);
      expect(newState.current.tranches).toEqual([3, 8, 3]);
    });

    it("deals with Random tiebreakers", () => {
      const state = initializer(14);
      const action: SwissDrawTreeAction = { type: "increment_round" };
      // apply twice to get to round 3
      const newState = reducerFunction(reducerFunction(state, action), action);
      expect(newState.current.tranches[0]).toBeGreaterThanOrEqual(3);
      expect(newState.current.tranches[0]).toBeLessThanOrEqual(4);
    });
  });

  describe("type: decrement_round", () => {
    it("fails gracefully when decrementing in first round", () => {
      const state = initializer(32);
      const action: SwissDrawTreeAction = { type: "decrement_round" };
      const newState = reducerFunction(state, action);
      expect(newState.current.round).toEqual(1);
    });

    it("decrements when available", () => {
      const state = initializer(32);
      state.current = {
        round: 4,
        tranches: [1, 3, 3, 0],
        prior: [[7], [4, 3], [2, 4, 1]],
      };
      const action: SwissDrawTreeAction = { type: "decrement_round" };
      const newState = reducerFunction(state, action);

      expect(newState.current).toEqual({
        round: 3,
        tranches: [2, 4, 1],
        prior: [[7], [4, 3]],
      });
    });
  });
});
