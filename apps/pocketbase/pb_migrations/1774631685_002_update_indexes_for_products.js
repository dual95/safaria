/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.indexes.push("CREATE UNIQUE INDEX idx_products_sku ON products (sku)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("products");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_products_sku"));
  return app.save(collection);
})
