import { describe, expect, it, vi, afterEach } from "vitest";import { createApp } from "../app.js";
import request from "supertest";

function mockStore() {
  return {
    kind: "mock",
    ready: vi.fn().mockResolvedValue(true),
    all: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue({ id: 1 }),
    remove: vi.fn().mockResolvedValue(true),
  }
}

afterEach(() => {
  vi.restoreAllMocks();
})

describe("vi.fn", () => {
  it ("records each call", () => {
    //create a mock function
    const send = vi.fn();

    //interact with function
    send("Seattle");
    send("Tacoma");

    //track how the function was used
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenCalledWith("Seattle");
  })

  it("returns what you tell it to", async () => {
    const all = vi.fn().mockResolvedValue([]);

    expect(await all()).toEqual([])
  })
})

describe ("a mock store", () => {
  it("trims the place before saving it", async () => {
    const store = mockStore();
    const app = createApp({ store });

    await request(app)
      .post("/api/postcards")
      .send({ place: " Seattle ", message: "It's spring here" });

    expect(store.add).toHaveBeenCalledWith({ place: "Seattle", message: "It's spring here"})
  })
})

it("all returns a postcard", async () => {
  const store = mockStore();
  const app = createApp({ store });
  store.all.mockResolvedValue([{ place: "Tacoma", message: "Visit the museum" }]);

  const res = await request(app).get("/api/postcards");
  expect(res.body).toEqual([{ place: "Tacoma", message: "Visit the museum" }])
})

describe("when the data store fails", async () => {
  it("is not ready", async () => {
    const store = mockStore();
    const app = createApp({ store });

    store.ready.mockRejectedValue(new Error("no database"));

    const res = await request(app).get("/ready");
    expect(res.status).toBe(503);
  })

  it ("answers 500", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const store = mockStore();
    const app = createApp({ store });
    store.all.mockRejectedValue(new Error("dick full"));

    const res = await request(app).get("/api/postcards");
    expect(res.status).toBe(500);
    expect(log).toBeCalled(1);
  })
})