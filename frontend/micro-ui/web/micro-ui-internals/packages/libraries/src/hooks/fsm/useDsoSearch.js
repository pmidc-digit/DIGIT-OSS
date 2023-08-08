import React from "react";
import { useQuery } from "react-query";
import DsoDetails from "../../services/molecules/FSM/DsoDetails";

const useDsoSearch = (tenantId, filters, config = {}) => {
  const result = useQuery(["DSO_SEARCH", filters], () => DsoDetails(tenantId, filters), config);
  console.log(result, "result");
  return result;
};

export default useDsoSearch;
