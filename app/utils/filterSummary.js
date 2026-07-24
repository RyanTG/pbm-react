// Builds the "Showing locations with ..." sentence describing active map
// filters, mirroring the pbm (Rails) FilterSummary model so wording stays
// consistent between the website and app. Ported categories are limited to
// filters that actually exist in this app (no zone/geography/Stern Army/
// ipdb_id support here).

const MAX_CATEGORIES = 3;
const MAX_MACHINE_NAMES = 5;

const toSentence = (items, { two, last }) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}${two}${items[1]}`;
  return `${items.slice(0, -1).join(", ")}${last}${items[items.length - 1]}`;
};

const toSentenceOr = (items) =>
  toSentence(items, { two: " or ", last: ", or " });

// query.machines already holds fully-resolved machine objects for a normal
// selection. query.opdbIdFilter is only ever populated as a deep-link
// fallback when the requested opdb_id(s) couldn't be resolved against the
// (global, unscoped) machine catalog at parse time - an id that still
// doesn't resolve here isn't a real/known machine, so it's dropped rather
// than described.
const machineFragment = (query, machinesCatalog) => {
  let names = [];
  let showsOtherModels = false;
  if (query.machines?.length > 0) {
    names = query.machines.map((m) => m.name);
    // machineGroupId is only set (via the "All Versions" toggle in
    // FilterMap) when exactly one machine is selected - it broadens the
    // request from that specific machine to its whole model group.
    showsOtherModels = query.machines.length === 1 && !!query.machineGroupId;
  } else if (query.opdbIdFilter?.length > 0) {
    names = query.opdbIdFilter
      .map((opdbId) => machinesCatalog.find((m) => m.opdb_id === opdbId))
      .filter(Boolean)
      .map((m) => m.name);
  }
  if (names.length === 0) return null;

  let text =
    names.length > MAX_MACHINE_NAMES
      ? "multiple machines"
      : toSentenceOr(names);
  if (showsOtherModels) {
    text = `${text} (and other models)`;
  }
  return query.icFilter ? `${text} with Insider Connected active` : text;
};

const locationTypeFragment = (query, locationTypes) => {
  const ids = query.locationTypeIds ?? [];
  if (ids.length === 0) return null;

  const names = locationTypes
    .filter((type) => ids.includes(type.id))
    .map((type) => type.name);
  if (names.length === 0) return null;

  return `location type ${toSentenceOr(names)}`;
};

const manufacturerFragment = (query) => {
  const names = query.manufacturerFilter ?? [];
  if (names.length === 0) return null;

  return `machines manufactured by ${toSentenceOr(names)}`;
};

const machineTypeFragment = (query) => {
  if (query.machineTypeFilter !== "em") return null;
  return "EM machines";
};

const yearRangeFragment = (query) => {
  const gte = query.machineYearGte;
  const lte = query.machineYearLte;
  if (gte == null && lte == null) return null;

  if (gte != null && lte != null)
    return `a machine made between ${gte} and ${lte}`;
  if (gte != null) return `a machine made in ${gte} or later`;
  return `a machine made in ${lte} or earlier`;
};

const atLeastNMachinesFragment = (query) => {
  if (!query.numMachines) return null;
  return `at least ${query.numMachines} machines`;
};

const locationIcFragment = (query) => {
  if (!query.locationIcFilter) return null;
  return "at least one Stern Insider Connected machine";
};

const operatorFragment = (query, operators) => {
  if (query.selectedOperator === "" || query.selectedOperator == null) {
    return null;
  }
  const operator = operators.find((o) => o.id === query.selectedOperator);
  return operator ? `operator ${operator.name}` : null;
};

const favoritesFragment = (query) => {
  if (!query.viewByFavoriteLocations) return null;
  return "your saved locations";
};

export const buildFilterSummary = ({
  query,
  machines = [],
  operators = [],
  locationTypes = [],
}) => {
  const fragments = [
    machineFragment(query, machines),
    locationTypeFragment(query, locationTypes),
    manufacturerFragment(query),
    machineTypeFragment(query),
    yearRangeFragment(query),
    atLeastNMachinesFragment(query),
    locationIcFragment(query),
    operatorFragment(query, operators),
    favoritesFragment(query),
  ].filter(Boolean);

  if (fragments.length === 0) return null;
  if (fragments.length > MAX_CATEGORIES) return "multiple filters";

  return toSentence(fragments, { two: " and ", last: ", and " });
};
