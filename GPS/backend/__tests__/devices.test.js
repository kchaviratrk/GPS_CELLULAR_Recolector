const devices = require("../devices");

describe("Devices Module", () => {
  it("should have a list of devices", () => {
    expect(Array.isArray(devices)).toBe(true);
    expect(devices.length).toBeGreaterThan(0);
  });

  it("should have valid device properties", () => {
    devices.forEach((device) => {
      expect(device).toHaveProperty("name");
      expect(device).toHaveProperty("ip");
    });
  });
});
