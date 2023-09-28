import httpStatus from "http-status";
import { app } from "../src/index";
import supertest from "supertest";

const server = supertest(app);

describe("POST /fruits", () => {
  it("should return 201 when inserting a fruit", async () => {
    const { status } = await server.post('/fruits').send({ name: 'fruta1', price: 10 });
    expect(status).toBe(httpStatus.CREATED);
  });

  it("should return 409 when inserting a fruit that is already registered", async () => {
    const fruit = { name: 'fruta1', price: 10 }
    await server.post('/fruits').send(fruit);
    const { status } = await server.post('/fruits').send(fruit);
    expect(status).toBe(httpStatus.CONFLICT);
  });

  it("should return 422 when inserting a fruit with data missing", async () => {
    const { status } = await server.post('/fruits').send({ name: 'testeWithOutPrice' });
    expect(status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });
});

describe("GET /fruits", () => {
  it("shoud return 404 when trying to get a fruit by an id that doesn't exist", async () => {
    const { status } = await server.get('/fruits/999');
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it("should return 400 when id param is present but not valid", async () => {
    const { status } = await server.get('/fruits/aaa');
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should return one fruit when given a valid and existing id", async () => {
    const id = 1;
    const fruit = { name: 'fruta1', price: 10 };
    await server.post('/fruits').send(fruit);
    const { status, body } = await server.get(`/fruits/${1}`);
    expect(status).toBe(httpStatus.OK);
    expect(body).toEqual({ ...fruit, id });
  });

  it("should return all fruits if no id is present", async () => {
    const fruits = [
      { name: 'fruta1', price: 10 },
      { name: 'fruta2', price: 15 }
    ];
    for(let i = 0; i < fruits.length; i++){
      await server.post('/fruits').send(fruits[i]);
    };
    const { status, body } = await server.get('/fruits');
    expect(status).toBe(httpStatus.OK);
    expect(body).toEqual([
      {...fruits[0], id: 1},
      {...fruits[1], id: 2}
    ]);
  });
});