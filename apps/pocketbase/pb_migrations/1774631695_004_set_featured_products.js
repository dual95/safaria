/// <reference path="../database-types.d.ts" />

/**
 * @param {import('pocketbase').default} app
 */
migrate((app) => {
  const dao = app.findRecordByFilter || app.dao();
  
  // Marcar los primeros 3 productos como destacados
  try {
    // ProPlan Puppy Complete - primer producto
    const product1 = app.findFirstRecordByFilter("products", "sku = 'PP-PC-15KG'");
    if (product1) {
      product1.set("featured", true);
      app.save(product1);
    }
  } catch (e) {
    console.log("Error updating product 1:", e);
  }

  try {
    // ProPlan Adult Complete - segundo producto
    const product2 = app.findFirstRecordByFilter("products", "sku = 'PP-AC-20KG'");
    if (product2) {
      product2.set("featured", true);
      app.save(product2);
    }
  } catch (e) {
    console.log("Error updating product 2:", e);
  }

  try {
    // ProPlan Senior - tercer producto
    const product3 = app.findFirstRecordByFilter("products", "sku = 'PP-SN-10KG'");
    if (product3) {
      product3.set("featured", true);
      app.save(product3);
    }
  } catch (e) {
    console.log("Error updating product 3:", e);
  }

  try {
    // ProPlan Sensitive - cuarto producto
    const product4 = app.findFirstRecordByFilter("products", "sku = 'PP-SS-12KG'");
    if (product4) {
      product4.set("featured", true);
      app.save(product4);
    }
  } catch (e) {
    console.log("Error updating product 4:", e);
  }

  try {
    // ProPlan Performance - quinto producto
    const product5 = app.findFirstRecordByFilter("products", "sku = 'PP-PF-18KG'");
    if (product5) {
      product5.set("featured", true);
      app.save(product5);
    }
  } catch (e) {
    console.log("Error updating product 5:", e);
  }

  try {
    // ProPlan Light & Fit - sexto producto
    const product6 = app.findFirstRecordByFilter("products", "sku = 'PP-LF-15KG'");
    if (product6) {
      product6.set("featured", true);
      app.save(product6);
    }
  } catch (e) {
    console.log("Error updating product 6:", e);
  }

  console.log("✅ Productos destacados actualizados exitosamente");
}, (app) => {
  // Rollback: desmarcar todos los productos como destacados
  const dao = app.findRecordByFilter || app.dao();
  
  try {
    const products = app.findRecordsByFilter("products", "featured = true", "-created", 100, 0);
    products.forEach(product => {
      product.set("featured", false);
      app.save(product);
    });
    console.log("✅ Rollback completado - productos ya no destacados");
  } catch (e) {
    console.log("Error en rollback:", e);
  }
});
