import { decorate, observable, action, set } from 'mobx';
import { set as _set, get as _get } from 'lodash';
import { stringify } from 'jsonpath';

export const BoxingType = {
  array: 'array',
  object: 'object',
  primitive: 'primitive',
};

export const BoxingWrapper = (type) => {
  let result = { isMatched: false, isCollapsed: false, value: undefined, type: type };
  switch (type) {
    case BoxingType.array:
      result.value = [];
      break;
    case BoxingType.object:
      result.value = {};
      break;
    default: {
    }
  }
  return result;
};

export function recursiveBoxing(obj) {
  let result = undefined;
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      result = BoxingWrapper(BoxingType.array);
      obj.forEach((element) => result.value.push(recursiveBoxing(element)));
    } else {
      result = BoxingWrapper(BoxingType.object);

      Object.entries(obj).forEach(([key, value]) => {
        result.value[key] = recursiveBoxing(value);
      });
    }
  } else {
    result = BoxingWrapper(BoxingType.primitive);
    result.value = obj;
  }
  return result;
}

class Store {
  tree = {};

  constructor(json) {
    this.setNewTree(json);
  }

  setNewTree(json) {
    this.tree = observable.object(recursiveBoxing(json));
    console.log('this.tree', this.tree);
  }

  setCollapsed(namespace, value) {
    set(this.tree, namespace.slice(1).push('isCollapsed'), value);
  }

  toggleCollapsed(namespace) {
    if (namespace.length === 1) {
      this.tree.isCollapsed = !this.tree.isCollapsed;
      return;
    }
    let path = [...namespace.slice(1)];
    let wrapper = _get(this.tree, path);
    wrapper.isCollapsed = !wrapper.isCollapsed;
    //let result = _set({}, path, !val);
    debugger;
    //set(this.tree, result);
  }
}

export default decorate(Store, {
  tree: observable,
  setNewTree: action.bound,
  setCollapsed: action.bound,
  toggleCollapsed: action.bound,
});
