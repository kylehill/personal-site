import React from "react";
import { reducerFunction, initializer, Tiebreak } from "./reducer";

const SwissDrawTree = () => {
  const [state, dispatch] = React.useReducer(reducerFunction, 32, initializer);

  const handleParticipantChange = (e: React.FocusEvent<HTMLInputElement>) => {
    dispatch({ type: "change_participants", participant_input: e.target.value });
  };

  const handleTiebreakChange = (e: React.FocusEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
    dispatch({ type: "change_tiebreak", tiebreak: e.target.value as Tiebreak });
  };

  return (
    <div>
      <label>
        Participants:{" "}
        <input
          type="text"
          value={state.options.participant_input}
          onChange={handleParticipantChange}
        />
      </label>
      <label>
        When participants with different records are paired, the higher ranked participant should{" "}
        <select value={state.options.tiebreak} onBlur={handleTiebreakChange}>
          <option value={Tiebreak.Random}>sometimes</option>
          <option value={Tiebreak.BestCase}>always</option>
          <option value={Tiebreak.WorstCase}>never</option>
        </select>{" "}
        win.
      </label>
    </div>
  );
};

export default SwissDrawTree;
