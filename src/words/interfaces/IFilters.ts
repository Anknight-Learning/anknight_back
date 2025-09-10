import { z } from "zod";

export namespace IFilters {
  const SortTypes = z.enum(["mostpopular", "mostused", "mostrecent"]);
  const OrderTypes = z.enum(["ASC", "DESC"]);

  export const Validation = {
    SortTypes,
    OrderTypes
  }

  export namespace Types {
    export type SortTypes = z.infer<typeof SortTypes>
    export type OrderTypes = z.infer<typeof OrderTypes>
  }

  export const MappingSort: Record<IFilters.Types.SortTypes, string> = {
    "mostpopular": "requested",
    "mostused": "frequency",
    "mostrecent": "d_updated"
  }

  export const MappingOrder: Record<IFilters.Types.OrderTypes, number> = {
    "ASC": 1,
    "DESC": -1
  }
}