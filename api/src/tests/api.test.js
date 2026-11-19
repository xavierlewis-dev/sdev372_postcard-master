import { describe, it, beforeEach, afterEach, expect, beforeAll, afterAll } from 'vitest';
import { createMemoryStore } from '../store';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

let store = null;

beforeAll(() => {
  console.log("before all")
})

afterAll(() => {
  console.log("after all")
})

beforeEach(() => {
  store = createMemoryStore({ seed: false});
  console.log("before")
})

afterEach(() => {
  console.log("after")
})

describe("in memory store", () => {
  it("starts empty", async () => {

      //assert what should be true
      expect(await store.ready()).toBe(true);
      expect(await store.all()).toEqual([]);
  })

  it("starts with records in a seeded store", async () => {
    const seededStore = createMemoryStore({seed: true})

    expect(await seededStore.ready()).toBe(true);
    expect(await seededStore.all()).not.toHaveLength(0);
  })

  it("returns record with the right format", async () => {
      const seededStore = createMemoryStore({seed: true})

      const allPC = await seededStore.all()

      for(const postcard of allPC) {
        expect(postcard).toHaveProperty("place");
        expect(postcard).toHaveProperty("message");
      }
  })

  it("stores all the items we add", async () => {
    await store.add({ place: "Seattle", message: "Missing you!"})
    await store.add({ place: "Tacoma", message: "The Aroma!"})
    await store.add({ place: "Olympia", message: "Beautiful Here!"})

    const postcards = await store.all();

    expect(postcards).toHaveLength(3);

    //simplify, convert array of objects to array of primitives
    const places = postcards.map(el => el.place);
    expect(places.sort()).toEqual(["Seattle", "Tacoma", "Olympia"].sort());
  })

  it("adds a UUID and timestamp to new postcards", async () => {
    await store.add({ place: "Seattle", message: "Missing you!"})

    const postcards = await store.all();
    const added = postcards[0]
    console.log(added)

    expect(added).toHaveProperty("id");
    expect(added.id).toMatch(UUID_REGEX);

    expect(added).toHaveProperty("sentAt");
    expect(added.sentAt).toMatch(UTC_TIMESTAMP);
  })
}) 