import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UPDATE_BOUNDS,
  CLEAR_FILTERS,
  SET_SELECTED_ACTIVITY_FILTER,
  CLEAR_ACTIVITY_FILTER,
  SET_MACHINE_FILTER,
  SET_NUM_MACHINES_FILTER,
  SET_VIEW_FAVORITE_LOCATIONS_FILTER,
  SET_LOCATION_TYPE_FILTER,
  SET_OPERATOR_FILTER,
  SET_MAX_ZOOM,
  SET_MACHINE_VERSION_FILTER,
  CLEAR_SEARCH_BAR_TEXT,
  SET_SEARCH_BAR_TEXT,
  UPDATE_IGNORE_MAX_ZOOM,
  TRIGGER_UPDATE_BOUNDS,
} from "../actions/types";
import { boundsToCoords } from "../utils/utilityFunctions";

export const initialState = {
  locationName: "",
  swLat: null,
  swLon: null,
  neLat: null,
  neLon: null,
  machineId: "",
  locationType: "",
  numMachines: 0,
  selectedOperator: "",
  selectedActivities: [],
  machine: {},
  maxZoom: false,
  viewByFavoriteLocations: false,
  machineGroupId: undefined,
  searchBarText: "",
  triggerUpdateBounds: false,
  forceTriggerUpdateBounds: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_BOUNDS: {
      const { swLat, swLon, neLat, neLon } = action.bounds;
      const coords = boundsToCoords(action.bounds);
      const { triggerUpdateBounds = false, forceTriggerUpdateBounds = false } =
        action;

      AsyncStorage.setItem("lastCoords", JSON.stringify(coords));
      return {
        ...state,
        swLat,
        swLon,
        neLat,
        neLon,
        triggerUpdateBounds,
        forceTriggerUpdateBounds,
      };
    }
    case TRIGGER_UPDATE_BOUNDS: {
      return {
        ...state,
        forceTriggerUpdateBounds: true,
      };
    }
    case UPDATE_IGNORE_MAX_ZOOM: {
      return {
        ...state,
        ignoreZoom: action.ignoreZoom,
      };
    }
    case SET_MACHINE_FILTER: {
      if (!action.machine) {
        return {
          ...state,
          machineId: "",
          machine: {},
        };
      } else {
        return {
          ...state,
          machineId: action.machine.id,
          machine: action.machine,
          machineGroupId: action.machine.machine_group_id,
        };
      }
    }
    case SET_NUM_MACHINES_FILTER:
      return {
        ...state,
        numMachines: action.numMachines,
      };
    case SET_VIEW_FAVORITE_LOCATIONS_FILTER:
      return {
        ...state,
        viewByFavoriteLocations: action.viewByFavoriteLocations,
      };
    case SET_LOCATION_TYPE_FILTER:
      return {
        ...state,
        locationType: action.locationType > -1 ? action.locationType : "",
      };
    case SET_OPERATOR_FILTER:
      return {
        ...state,
        selectedOperator:
          action.selectedOperator > -1 ? action.selectedOperator : "",
      };
    case CLEAR_FILTERS:
      return {
        ...state,
        machineId: "",
        locationType: "",
        numMachines: 0,
        selectedOperator: "",
        machine: {},
        viewByFavoriteLocations: false,
        machineGroupId: undefined,
      };
    case SET_SELECTED_ACTIVITY_FILTER: {
      AsyncStorage.setItem(
        "selectedActivities",
        JSON.stringify(action.selectedActivities),
      );
      return {
        ...state,
        selectedActivities: action.selectedActivities,
      };
    }
    case CLEAR_ACTIVITY_FILTER: {
      AsyncStorage.setItem("selectedActivities", JSON.stringify([]));

      return {
        ...state,
        selectedActivities: [],
      };
    }
    case SET_MAX_ZOOM:
      return {
        ...state,
        maxZoom: action.maxZoom || false,
      };
    case SET_MACHINE_VERSION_FILTER:
      return {
        ...state,
        machineGroupId: action.machineGroupId,
      };
    case SET_SEARCH_BAR_TEXT:
      return {
        ...state,
        searchBarText: action.searchBarText,
      };
    case CLEAR_SEARCH_BAR_TEXT:
      return {
        ...state,
        searchBarText: "",
      };
    default:
      return state;
  }
};
