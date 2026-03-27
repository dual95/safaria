/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("products");

  const record0 = new Record(collection);
    record0.set("name", "PROPLAN ADULTO RAZA MEDIANA 17.5KG");
    record0.set("sku", "00299");
    record0.set("price", 145.5);
    record0.set("category", "Alimento Seco");
    record0.set("brand", "ProPlan");
    record0.set("stock", 50);
    record0.set("featured", false);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("name", "PROPLAN ADULTO RAZA MEDIANA 3 KG + ESPIRULINA");
    record1.set("sku", "00301");
    record1.set("price", 31.99);
    record1.set("category", "Alimento Seco");
    record1.set("brand", "ProPlan");
    record1.set("stock", 100);
    record1.set("featured", false);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("name", "PROPLAN ADULTO RAZA MEDIANA 7.5 KG + ESPIRULINA");
    record2.set("sku", "00302");
    record2.set("price", 16.75);
    record2.set("category", "Alimento Seco");
    record2.set("brand", "ProPlan");
    record2.set("stock", 75);
    record2.set("featured", false);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("name", "PROPLAN ADULTO SENSITIVE SKIN & STOMACH 10 KG");
    record3.set("sku", "00304");
    record3.set("price", 97.99);
    record3.set("category", "Alimento Especializado");
    record3.set("brand", "ProPlan");
    record3.set("stock", 40);
    record3.set("featured", false);
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("name", "PROPLAN ADULTO RAZA GRANDE 13 KG + ESPIRULINA");
    record4.set("sku", "00306");
    record4.set("price", 116.99);
    record4.set("category", "Alimento Seco");
    record4.set("brand", "ProPlan");
    record4.set("stock", 60);
    record4.set("featured", false);
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("name", "PROPLAN ADULTO REDUCED CALORIE 3 KG");
    record5.set("sku", "00308");
    record5.set("price", 34.75);
    record5.set("category", "Alimento Especializado");
    record5.set("brand", "ProPlan");
    record5.set("stock", 80);
    record5.set("featured", false);
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
