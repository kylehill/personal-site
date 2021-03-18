import type { Reducer } from "react";

export enum Tiebreak {
  BestCase = "BestCase",
  WorstCase = "WorstCase",
  Random = "Random",
}

type SwissDrawTreeCurrent = {
  round: number;
  tranches: number[];
  prior: number[][];
};

type SwissDrawTreeState = {
  options: {
    participants: number;
    participant_input: string;
    valid: boolean;
    tiebreak: Tiebreak;
  };
  current: SwissDrawTreeCurrent;
};

export type SwissDrawTreeAction =
  | {
      type: "change_participants";
      participant_input: string;
    }
  | {
      type: "change_tiebreak";
      tiebreak: Tiebreak;
    }
  | {
      type: "increment_round";
    }
  | {
      type: "decrement_round";
    };

const resetCurrent = (participants: number): SwissDrawTreeCurrent => ({
  round: 1,
  tranches: [participants],
  prior: [],
});

const progressTranches = (tranches: number[], tiebreak: Tiebreak): number[] => {
  const updated = Array.from(Array(tranches.length + 1), (_) => 0);

  for (let losses = 0; losses < tranches.length; losses++) {
    const tranche = tranches[losses];

    if (tranche % 2 === 0) {
      updated[losses] += tranche / 2;
      updated[losses + 1] += tranche / 2;
      continue;
    }

    const nextTranche = tranches.findIndex((count, idx) => {
      return idx > losses && count > 0;
    });

    if (nextTranche === -1) {
      updated[losses] += Math.ceil(tranche / 2);
      updated[losses + 1] += Math.floor(tranche / 2);
      continue;
    }

    tranches[nextTranche] -= 1;

    const thisTiebreak: Tiebreak =
      tiebreak === Tiebreak.Random
        ? // this is inentionally random, so
          /* istanbul ignore next */
          Math.random() > 0.5
          ? Tiebreak.BestCase
          : Tiebreak.WorstCase
        : tiebreak;

    switch (thisTiebreak) {
      case Tiebreak.WorstCase: {
        updated[losses] += Math.floor(tranche / 2);
        updated[losses + 1] += Math.ceil(tranche / 2) + 1;
        continue;
      }

      case Tiebreak.BestCase: {
        updated[losses] += Math.ceil(tranche / 2);
        updated[losses + 1] += Math.floor(tranche / 2);
        updated[losses + 2] += 1;
        continue;
      }
    }
  }

  return updated;
};

export const reducerFunction: Reducer<SwissDrawTreeState, SwissDrawTreeAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "change_participants": {
      const participants = Number(action.participant_input);

      return {
        ...state,
        options: {
          ...state.options,
          participants,
          participant_input: action.participant_input,
          valid: participants > 0,
        },
        current: resetCurrent(participants),
      };
    }

    case "change_tiebreak": {
      return {
        ...state,
        options: {
          ...state.options,
          tiebreak: action.tiebreak,
        },
        current: resetCurrent(state.options.participants),
      };
    }

    case "increment_round": {
      return {
        ...state,
        current: {
          round: state.current.round + 1,
          prior: [...state.current.prior, state.current.tranches],
          tranches: progressTranches(state.current.tranches, state.options.tiebreak),
        },
      };
    }

    case "decrement_round": {
      if (state.current.round === 1) {
        return state;
      }

      return {
        ...state,
        current: {
          round: state.current.round - 1,
          tranches: state.current.prior[state.current.prior.length - 1],
          prior: state.current.prior.slice(0, state.current.prior.length - 1),
        },
      };
    }
  }
};

export const initializer = (participants = 32): SwissDrawTreeState => ({
  options: {
    participants,
    participant_input: participants.toString(),
    valid: true,
    tiebreak: Tiebreak.Random,
  },
  current: resetCurrent(participants),
});
