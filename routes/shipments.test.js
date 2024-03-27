"use strict";

const shipItApi = require("../shipItApi");
shipItApi.shipProduct = jest.fn();

const request = require("supertest");
const app = require("../app");

describe("POST /shipments", function () {
  test("valid", async function () {
    shipItApi.shipProduct.mockReturnValue(9999);

    const resp = await request(app).post("/shipments").send({
      productId: 1000,
      name: "Test Tester",
      addr: "100 Test St",
      zip: "12345-6789",
    });

    expect(resp.body).toEqual({ shipped: 9999 });
  });

  test("throws error if empty request body", async function () {
    const resp = await request(app)
      .post("/shipments")
      .send();
    expect(resp.statusCode).toEqual(400);
  });

  test("throws error if request data is invalid", async function () {
    const resp = await request(app).post("/shipments").send({
      productId: 0,
      new_property: "Test Tester",
      zip: 12345
    });

    expect(resp.body).toEqual({
      error: {
        message: [
          "instance.productId must be greater than or equal to 1000",
          "instance.zip is not of a type(s) string",
          "instance is not allowed to have the additional property \"new_property\"",
          "instance requires property \"name\"",
          "instance requires property \"addr\""
        ],
        status: 400
      }
    });
  });
});

describe("POST /shipments/multi", function () {
  test("valid", async function () {
    shipItApi.shipProduct
      .mockReturnValueOnce(9999)
      .mockReturnValueOnce(9998);

    const resp = await request(app).post("/shipments/multi").send({
      productIds: [1001, 1002],
      name: "Test Tester",
      addr: "100 Test St",
      zip: "12345-6789",
    });

    expect(resp.body).toEqual({ shipped: [9999, 9998] });
  });

  test("throws error if empty request body", async function () {
    const resp = await request(app)
      .post("/shipments/multi")
      .send();

    expect(resp.statusCode).toEqual(400);
  });

  test("throws error if request data is invalid", async function () {
    const resp = await request(app).post("/shipments/multi").send({
      productIds: 1001,
      new_property: "Test Tester",
      zip: "12345"
    });

    expect(resp.body).toEqual({
      error: {
        message: [
          "instance.productIds is not of a type(s) array",
          "instance.zip does not match pattern \"[0-9]{5}-[0-9]{4}\"",
          "instance is not allowed to have the additional property \"new_property\"",
          "instance requires property \"name\"",
          "instance requires property \"addr\""
        ],
        status: 400
      }
    });
  });
});


