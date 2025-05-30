import {
  FETCHING_LOCATION_TYPES,
  FETCHING_LOCATION_TYPES_SUCCESS,
  FETCHING_LOCATION_TYPES_FAILURE,
  FETCHING_LOCATIONS,
  FETCHING_LOCATIONS_SUCCESS,
  FETCHING_LOCATIONS_FAILURE,
  SELECT_LOCATION_LIST_FILTER_BY,
  LOCATION_DETAILS_CONFIRMED,
  LOCATION_MACHINE_REMOVED,
  MACHINE_ADDED_TO_LOCATION,
  SET_SELECTED_MAP_LOCATION,
} from "../actions/types";

const moment = require("moment");

export const initialState = {
  isFetchingLocationTypes: false,
  locationTypes: [],
  isFetchingLocations: false,
  mapLocations: [],
  selectedLocationListFilter: 0,
  selectedMapLocation: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_LOCATION_TYPES:
      return {
        ...state,
        isFetchingLocationTypes: true,
      };
    case FETCHING_LOCATION_TYPES_SUCCESS:
      return {
        ...state,
        isFetchingLocationTypes: false,
        locationTypes: action.locationTypes,
      };
    case FETCHING_LOCATION_TYPES_FAILURE:
      return {
        ...state,
        isFetchingLocationTypes: false,
        locationTypes: [],
      };
    case FETCHING_LOCATIONS:
      return {
        ...state,
        isFetchingLocations: true,
      };
    case FETCHING_LOCATIONS_SUCCESS:
      return {
        ...state,
        isFetchingLocations: false,
        mapLocations: action.locations,
      };
    case FETCHING_LOCATIONS_FAILURE:
      return {
        ...state,
        isFetchingLocations: false,
        mapLocations: [],
      };
    case SELECT_LOCATION_LIST_FILTER_BY:
      return {
        ...state,
        selectedLocationListFilter: action.idx,
      };
    case LOCATION_DETAILS_CONFIRMED: {
      const mapLocations = state.mapLocations.map((loc) => {
        if (loc.id === action.id) {
          return {
            ...loc,
            updated_at: moment.utc().format(),
          };
        } else return loc;
      });
      return {
        ...state,
        mapLocations,
      };
    }
    case LOCATION_MACHINE_REMOVED: {
      const { machine_id, location_id } = action;
      const mapLocations = state.mapLocations.map((loc) => {
        if (loc.id === location_id) {
          const machine_ids = loc.machine_ids.filter((id) => id !== machine_id);
          return {
            ...loc,
            updated_at: moment.utc().format(),
            machine_count: loc.machine_count - 1,
            machine_ids,
          };
        }
        return loc;
      });

      return {
        ...state,
        mapLocations,
      };
    }
    case MACHINE_ADDED_TO_LOCATION: {
      const { machine_id, location_id } = action;
      const mapLocations = state.mapLocations.map((loc) => {
        if (loc.id === location_id) {
          const machine_ids = loc.machine_ids.concat(machine_id);
          return {
            ...loc,
            updated_at: moment.utc().format(),
            machine_count: loc.machine_count + 1,
            machine_ids,
          };
        }
        return loc;
      });

      return {
        ...state,
        mapLocations,
      };
    }
    case SET_SELECTED_MAP_LOCATION: {
      return {
        ...state,
        selectedMapLocation: action.id,
      };
    }
    default:
      return state;
  }
};
