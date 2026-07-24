// Parses map filter params out of a universal/deep link URL (e.g.
// https://pinballmap.com/map?by_machine_single_id[]=3415&by_opdb_id[]=GweeP-MW95j).
// by_opdb_id accepts either a single value (by_opdb_id=X) or an array
// (by_opdb_id[]=X&by_opdb_id[]=Y), matching by_machine_single_id.
// Intentionally does not parse `user_faved` (requires being logged in as that
// specific user - not meaningful as a shareable link) or the machine-scoped
// `by_machine_single_id_ic`/`by_machine_id_ic` IC filter (a compound filter
// derived from an already-selected single machine in the UI, not an
// independent URL param today).

const MACHINE_TYPE_EM_VALUES = ["em", "me"];

export const parseFilterParamsFromUrl = (url) => {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const params = parsed.searchParams;

  const machineIds = [
    ...params.getAll("by_machine_single_id[]"),
    ...params.getAll("by_machine_single_id"),
  ];
  const opdbIds = [
    ...params.getAll("by_opdb_id[]"),
    ...params.getAll("by_opdb_id"),
  ];
  const locationTypeIds = [
    ...params.getAll("by_type_id[]"),
    ...params.getAll("by_type_id"),
  ];
  const operatorId = params.get("by_operator_id");
  const manufacturers = [
    ...params.getAll("manufacturer[]"),
    ...params.getAll("manufacturer"),
  ];
  const machineTypeEm = params
    .getAll("by_machine_type[]")
    .some((value) => MACHINE_TYPE_EM_VALUES.includes(value));
  const machineYearGte = params.has("by_machine_year_gte")
    ? Number(params.get("by_machine_year_gte"))
    : null;
  const machineYearLte = params.has("by_machine_year_lte")
    ? Number(params.get("by_machine_year_lte"))
    : null;
  const locationIcActive = params.get("by_ic_active") === "true";
  const numMachines = params.has("by_at_least_n_machines_type")
    ? Number(params.get("by_at_least_n_machines_type"))
    : null;

  const hasFilters =
    machineIds.length > 0 ||
    opdbIds.length > 0 ||
    locationTypeIds.length > 0 ||
    !!operatorId ||
    manufacturers.length > 0 ||
    machineTypeEm ||
    machineYearGte !== null ||
    machineYearLte !== null ||
    locationIcActive ||
    numMachines !== null;

  if (!hasFilters) return null;

  return {
    machineIds,
    opdbIds,
    locationTypeIds,
    operatorId,
    manufacturers,
    machineTypeEm,
    machineYearGte,
    machineYearLte,
    locationIcActive,
    numMachines,
  };
};
