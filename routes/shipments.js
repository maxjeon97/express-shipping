"use strict";

const express = require("express");
const { BadRequestError } = require("../expressError");
const router = new express.Router();

const { shipProduct } = require("../shipItApi");

const jsonschema = require('jsonschema');
const shippingOrder = require('../schemas/shippingOrder.json');
const shippingOrderMulti = require('../schemas/shippingOrderMulti.json');


/** POST /shipments
 *
 * VShips an order coming from json body:
 *   { productId, name, addr, zip }
 *
 * Returns { shipped: shipId }
 */

router.post("/", async function (req, res, next) {
  const result = jsonschema.validate(
    req.body, shippingOrder, { required: true });

  if (!result.valid) {
    const errs = result.errors.map(err => err.stack);
    throw new BadRequestError(errs);
  }
  else {
    const { productId, name, addr, zip } = req.body;
    const shipId = await shipProduct({ productId, name, addr, zip });
    return res.json({ shipped: shipId });
  }
});


/** POST  /shipments/multi
 *
 * VShips multiple orders coming from JSON body:
 * {productIds, name, addr, zip}
 *
 * Returns { shipped: [shipId, ...]}
*/

router.post("/multi", async function (req, res, next) {
  const result = jsonschema.validate(
    req.body, shippingOrderMulti, { required: true });

  if (!result.valid) {
    const errs = result.errors.map(err => err.stack);
    throw new BadRequestError(errs);
  }

  const { productIds, name, addr, zip } = req.body;

  const promises = productIds.map(p => shipProduct({ p, name, addr, zip }));

  const shipIds = await Promise.all(promises);

  return res.json({ shipped: shipIds });
});


module.exports = router;