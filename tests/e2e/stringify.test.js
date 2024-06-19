import { stringify } from "../../src/render";

describe("Convert data type to render prop string", function () {
  it("should correctly serialize a number", () => {
    const input = 2;
    const result = stringify(input);
    expect(result).toBe("_9s35Ufa7M67wghwT_2_9s35Ufa7M67wghwT_");
  });

  it("should correctly serialize a bigInt", () => {
    const input = 27n;
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_&quot;__BigInt__27&quot;_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize Date", () => {
    const input = new Date();
    const result = stringify(input);
    expect(result).toBe(
      `_9s35Ufa7M67wghwT_&quot;${input.toISOString()}&quot;_9s35Ufa7M67wghwT_`
    );
  });

  it("should correctly serialize regular expressions", () => {
    const input =
      /\s*\$trigger\s*\(\s*([^,]+)\s*(?:,\s*([^,]+)\s*)?(?:,\s*{\s*([^{}$]+)\s*}\s*)?\s*\)/g;
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_&quot;__RegExp__&#x2F;\\\\s*\\\\$trigger\\\\s*\\\\(\\\\s*([^,]+)\\\\s*(?:,\\\\s*([^,]+)\\\\s*)?(?:,\\\\s*{\\\\s*([^{}$]+)\\\\s*}\\\\s*)?\\\\s*\\\\)&#x2F;g&quot;_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize a undefined", () => {
    const input = undefined;
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_&quot;__undefined__&quot;_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize a plain object", () => {
    const input = { key: "value" };
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_{&quot;key&quot;:&quot;value&quot;}_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize a Map object", () => {
    const input = new Map();
    input.set(1);
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Map&quot;,&quot;value&quot;:[[1,&quot;__undefined__&quot;]]}_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize a WeakMap", () => {
    const password = "ASa21scy$!@uyh920skaYGSH34228";
    const input = new WeakMap();
    const result = stringify(input);
    const match = /__WeakMap__([^]*?)&quot;_/.exec(result);
    const randomId = match[1];
    const output = globalThis[password][`__WeakMap__${randomId}`];
    expect(output).toEqual(input);
  });

  it("should correctly serialize a Set", () => {
    const input = new Set([1, 3]);
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_{&quot;dataType&quot;:&quot;Set&quot;,&quot;value&quot;:[1,3]}_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize a WeakSet", () => {
    const password = "ASa21scy$!@uyh920skaYGSH34228";
    const input = new WeakSet();
    const result = stringify(input);
    const match = /__WeakSet__([^]*?)&quot;/.exec(result);
    const randomId = match[1];
    const output = globalThis[password][`__WeakSet__${randomId}`];
    expect(output).toEqual(input);
  });

  it("should correctly serialize a function", () => {
    const input = () => new Set([1, 3]);
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_&quot;__function__function input() {return new Set([1, 3]);}&quot;_9s35Ufa7M67wghwT_"
    );
  });

  it("should handle empty objects", () => {
    const input = {};
    const result = stringify(input);
    expect(result).toBe("_9s35Ufa7M67wghwT_{}_9s35Ufa7M67wghwT_");
  });

  it("should correctly serialize a string", () => {
    const input = "$render is the best JavaScript framework in the world";
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_&quot;$render is the best JavaScript framework in the world&quot;_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize Symbol", () => {
    const input = Symbol.for("greatest");
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_&quot;__symbol__Symbol(greatest)&quot;_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly handle nested arrays", () => {
    const input = [{ key: ["value1", "value2"] }];
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_[{&quot;key&quot;:[&quot;value1&quot;,&quot;value2&quot;]}]_9s35Ufa7M67wghwT_"
    );
  });

  it("should correctly serialize an array of objects", () => {
    const input = [{ key: "value" }, { key: "another value" }];
    const result = stringify(input);
    expect(result).toBe(
      "_9s35Ufa7M67wghwT_[{&quot;key&quot;:&quot;value&quot;},{&quot;key&quot;:&quot;another value&quot;}]_9s35Ufa7M67wghwT_"
    );
  });
});
