import { decorate, observable } from 'mobx';

export function recursiveMerge(obj, addition) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      obj.forEach((element) => recursiveMerge(element, addition));
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        recursiveMerge(value, addition);
      });
      Object.assign(obj, addition);
    }
  }
  return obj;
}

class Store {
  tree = {};

  constructor(json) {
    this.setNewTree(json);
  }

  setNewTree(json) {
    this.tree = recursiveMerge(json, { __is_matching: 'false' });
  }
}

export default decorate(Store, {
  tree: observable,
});
