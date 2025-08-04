// formReducer.ts
import { FormState, Designer } from "@/components/admin/Types";

export type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof Omit<FormState, "">;
      value: any;
    }
  | { type: "LOAD_INITIAL"; data: Omit<FormState, "mediaItems"> }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "ADD_TAG"; tag: string }
  | { type: "REMOVE_TAG"; index: number }
  | { type: "SET_DESIGNERS"; designers: Designer[] }
  | { type: "SET_ERROR"; message: string };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "LOAD_INITIAL":
      return {
        ...state,
        ...action.data,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading,
      };

    case "ADD_TAG":
      return {
        ...state,
        tags: [...state.tags, action.tag],
      };

    case "REMOVE_TAG":
      return {
        ...state,
        tags: state.tags.filter((_, i) => i !== action.index),
      };

    case "SET_DESIGNERS":
      return {
        ...state,
        designers: action.designers,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.message,
      };

    default:
      return state;
  }
}
