import assert from "node:assert/strict";
import FormDataTree from "../index.js";

// Creating a FormData object for testing.
const formData = new FormData();

formData.append("your-name", "John Doe");
formData.append("your-penguin[]", "Adelie");
formData.append("your-penguin[]", "Emperor");
formData.append("your-penguin[]", "Humboldt");
formData.append("your-file", new Blob(["bla bla bla"]));

// FormDataTree.from() creates a FormDataTree object from form data.
const formDataTree = FormDataTree.from(formData);

// FormDataTree.prototype.getAll() returns an object containing form data values.
const yourName = formDataTree.getAll("your-name");

assert.deepEqual(yourName, { 0: "John Doe" });

const yourPenguins = formDataTree.getAll("your-penguin");

assert.deepEqual(yourPenguins, { 0: "Adelie", 1: "Emperor", 2: "Humboldt" });

// For file fields, use FormDataTree.prototype.getAllFiles().
const yourFile = formDataTree.getAllFiles("your-file");

assert.ok(yourFile[0] instanceof File);
