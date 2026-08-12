import assert from "node:assert/strict";
import FormDataTree from "../index.js";

describe("FormDataTree", function () {
  // Creating a FormData object for testing.
  const formData = new FormData();

  formData.append("your-name", "John Doe");
  formData.append("your-penguin[]", "Adelie");
  formData.append("your-penguin[]", "Emperor");
  formData.append("your-penguin[]", "Humboldt");
  formData.append("your-file", new Blob(["bla bla bla"]));

  // FormDataTree.from() creates a FormDataTree object from form data.
  const formDataTree = FormDataTree.from(formData);

  describe("getAll()", function () {
    const yourName = formDataTree.getAll("your-name");

    it(`should return a single value`, function () {
      assert.deepEqual(yourName, { 0: "John Doe" });
    });

    const yourPenguins = formDataTree.getAll("your-penguin");

    it(`should return multiple values`, function () {
      assert.deepEqual(yourPenguins, {
        0: "Adelie",
        1: "Emperor",
        2: "Humboldt",
      });
    });
  });

  describe("getAllFiles()", function () {
    const yourFile = formDataTree.getAllFiles("your-file");

    it(`should return a File object`, function () {
      assert(yourFile[0] instanceof File);
    });
  });
});
