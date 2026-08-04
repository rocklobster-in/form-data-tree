import { dissolveName } from "./helpers";

export default function FormDataTree() {
  this.trunk = {};
  this.largestIndex = 0;
}

FormDataTree.prototype = {
  filter(callback) {
    if (!(callback instanceof Function)) {
      throw new TypeError("'callback' is not a function");
    }

    const newTree = new FormDataTree();

    for (let [key, value] of Object.entries(this.trunk)) {
      if (value instanceof FormDataTree) {
        value = value.filter(callback);

        if (value.size) {
          newTree.set(key, value);
        }
      } else {
        if (callback(value)) {
          newTree.set(key, value);
        }
      }
    }

    return newTree;
  },

  getAll(name, filter = "string") {
    const nameParts = dissolveName(name);

    if (!nameParts.length) {
      return {};
    }

    let branch = this,
      currentNamePart;

    if ("string" === filter) {
      branch = branch.filter((value) => "string" === typeof value);
    } else if ("file" === filter) {
      branch = branch.filter((value) => value instanceof File);
    }

    while ((currentNamePart = nameParts.shift())) {
      if (
        /^[0-9]*$/.test(currentNamePart) ||
        undefined === branch.trunk[currentNamePart]
      ) {
        return {};
      }

      branch = branch.trunk[currentNamePart];
    }

    if (branch instanceof FormDataTree) {
      return branch.valueOf();
    } else {
      return { 0: branch };
    }
  },

  getAllFiles(name) {
    return this.getAll(name, "file");
  },

  set(key, value) {
    value = FormDataTree.excludeBlank(value);

    if (!value) {
      return this; // Don't include empty values!
    }

    if ("" === key) {
      key = this.largestIndex++;
    } else if (/^[0-9]+$/.test(key)) {
      key = parseInt(key);

      if (this.largestIndex <= key) {
        this.largestIndex = key + 1;
      }
    }

    this.trunk[key.toString()] = value;

    return this;
  },

  valueOf() {
    const obj = {};

    for (let [key, value] of Object.entries(this.trunk)) {
      obj[key] = value.valueOf();
    }

    return obj;
  },

  get size() {
    return Object.keys(this.trunk).length;
  },
};

FormDataTree.excludeBlank = (value) => {
  if (value instanceof FormDataTree) {
    return value;
  } else if (value instanceof Blob) {
    if (value.size) {
      return value;
    }
  } else {
    value = value.toString().trim();

    if (value) {
      return value;
    }
  }
};

FormDataTree.from = (formData) => {
  if (!(formData instanceof FormData)) {
    throw new TypeError("'formData' is not a FormData object");
  }

  const tree = new FormDataTree();

  for (let [key, value] of formData) {
    const nameParts = dissolveName(key);

    if (!nameParts.length) {
      continue;
    }

    value = FormDataTree.excludeBlank(value);

    if (!value) {
      continue; // Don't include empty values!
    }

    const lastName = nameParts.pop();

    const terminalNode = nameParts.reduce((previous, current) => {
      if (previous.trunk[current] instanceof FormDataTree) {
        return previous.trunk[current];
      }

      const newNode = new FormDataTree();

      previous.set(current, newNode);

      return newNode;
    }, tree);

    terminalNode.set(lastName, value);
  }

  return tree;
};
