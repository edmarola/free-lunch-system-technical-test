export const createPurchaseOrder = (ingredients: string[]): void => {
  // TODO: this function is called only then the ingredients are not available in the warehouse.
  // TODO: a request is sent to the farmers market API.
  // TODO: this market api is a dependency inyected
  // TODO: a record is created in the database for purchase order. If a retry is needed then
  // TODO: the record is stored with the value ON HOLD, otherwise it is stored with the value COMPLETED
  // TODO: when the retry finally completes, the record is updated with the value COMPLETED
};
