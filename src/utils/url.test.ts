import { sanitiePath, sanitizeUrl, sanitizeUrlPath } from "./url";

describe("sanitiePath", () => {
  it("removes double slashes", () => {
    expect(sanitiePath("foo//bar")).toEqual("foo/bar");
  });
  it("removes leading slashes", () => {
    expect(sanitiePath("/foo/bar")).toEqual("foo/bar");
  });
});

describe("sanitizeUrl", () => {
  it("removes trailing slash", () => {
    expect(sanitizeUrl("https://foo/bar/")).toEqual("https://foo/bar");
  });
});

describe("sanitizeUrlPath", () => {
  it("removes double slashes", () => {
    expect(sanitizeUrlPath("foo", "//bar")).toEqual("foo/bar");
  });
  it("removes leading url slash", () => {
    expect(sanitizeUrlPath("https://foo.com/", "bar/")).toEqual(
      "https://foo.com/bar"
    );
  });
  it("adds query params", () => {
    expect(sanitizeUrlPath("foo", "bar", { baz: "qux" })).toEqual(
      "foo/bar?baz=qux"
    );
  });
});
