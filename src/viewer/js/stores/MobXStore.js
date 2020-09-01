import { decorate, observable, action, set, toJS } from 'mobx';
import { set as _set, get as _get, isString } from 'lodash';
import jp from 'jsonpath';
import List from 'collections/list';
import shortid from 'shortid';

export const BoxingType = {
  array: 'array',
  object: 'object',
  primitive: 'primitive',
};

const BoxingWrapperTypeName = 'BoxingWrapper';

export const BoxingWrapper = (type, namespace) => {
  let self = {
    _id: shortid.generate(),
    typeName: BoxingWrapperTypeName,
    namespace: namespace,
    isVisible: false,
    isMatched: false,
    isCollapsed: false,
    value: undefined,
    type: type,
    subNodesCount: 0,
    slice: function (a, b) {
      let clone = Object.assign({}, this);
      clone._id = shortid.generate();
      clone.value = this.value.slice(a, b);
      //clone.slice = clone.slice.bind(clone);
      clone.isSliced = true;
      return clone;
    },
    setChildrenVisibility: function (value) {},
  };
  if (self.type !== BoxingType.array) {
    delete self.slice;
  } else {
    //self.slice = self.slice.bind(self);
  }
  switch (type) {
    case BoxingType.array:
      self.value = [];
      break;
    case BoxingType.object:
      self.value = {};
      break;
    default: {
    }
  }
  return self;
};

function recursiveStructuralBoxing(obj, namespace) {
  let tree = undefined;
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      tree = BoxingWrapper(BoxingType.array, namespace);
      obj.forEach((element, index) =>
        tree.value.push(recursiveStructuralBoxing(element, namespace.concat(['value', index])))
      );
      tree.subNodesCount = tree.value.reduce((accumulator, item) => {
        return (accumulator += item.subNodesCount);
      }, obj.length);
    } else {
      tree = BoxingWrapper(BoxingType.object, namespace);

      Object.entries(obj).forEach(([key, propValue]) => {
        let boxingResult = recursiveStructuralBoxing(propValue, namespace.concat(['value', key]));
        tree.value[key] = boxingResult;
        tree.subNodesCount += boxingResult.subNodesCount + 1;
      });
    }
  } else {
    tree = BoxingWrapper(BoxingType.primitive, namespace);
    tree.value = obj;
  }
  return tree;
}

function flatten(treeNode, flatList = null) {
  if (!treeNode || !treeNode.typeName || treeNode.typeName !== BoxingWrapperTypeName) {
    throw new Error('flatten function accept only tree based on BoxingWrapper');
  }
  if (!flatList) {
    flatList = new List([]);
  }
  flatList.push(treeNode);
  if (treeNode.type === BoxingType.primitive) return;
  let descendants =
    treeNode.typeName === BoxingType.array ? treeNode.value : Object.values(treeNode.value);
  descendants.forEach((item) => flatten(item, flatList));
  return flatList;
}

const pageSize = 100;

class Store {
  // observables
  tree = {};
  hasMore = { value: true };

  // non observed
  flatListOfNodes = null;
  visibleItemsTreshold = 0;
  visibleItemsCount = 0;
  currentListNode = null;
  formula = null;

  constructor(json) {
    this.resetStore();
    this.setNewTree(json);
  }

  resetStore() {
    // observables
    this.tree = {};
    this.hasMore.value = true;

    // non observed
    this.flatListOfNodes = null;
    this.visibleItemsTreshold = 0;
    this.visibleItemsCount = 0;
    this.currentListNode = null;
    this.formula = null;
  }

  setNewTree(json) {
    this.resetStore();
    let prep = recursiveStructuralBoxing(json, ['root']);
    this.tree = observable.object(prep);
    this.flatListOfNodes = flatten(this.tree);
    this.currentListNode = this.flatListOfNodes.head.next;
    this.showNextPage(300);
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

    //set(this.tree, result);
  }

  cleanAppliedFormula() {
    if (!this.formula) {
      return true;
    }
    try {
      //jp.apply(this.tree, this.formula, (node) => (node.isMatched = false));
      let nodes = jp.query(this.tree, this.formula);
      console.log(`CLEAN formula on ${nodes.count} nodes`);

      nodes.forEach((node) => {
        node.isMatched = false;
      });
      this.formula = null;
      return true;
    } catch (ex) {
      console.warn('clean formula', ex);
      return false;
    }
  }

  setJsonPath(formula) {
    if (!(isString(formula) && formula.length) || !this.cleanAppliedFormula()) {
      console.warn('formula not applied');
      return;
    }
    try {
      let nodes = jp.query(this.tree, formula);
      console.log(`applyinf formula on ${nodes.count} nodes`);
      nodes.forEach((node) => {
        node.isMatched = true;
      });
      this.formula = formula;
    } catch (ex) {
      console.log('jsonpath', ex);
    }
  }

  showNextPage(size = pageSize) {
    console.log('showNextPage');
    this.visibleItemsTreshold += size;

    while (this.visibleItemsCount < this.visibleItemsTreshold && this.currentListNode.value) {
      this.currentListNode.value.isVisible = true;
      this.currentListNode = this.currentListNode.next;
      this.visibleItemsCount++;
    }
    this.hasMore = { value: this.flatListOfNodes.length > this.visibleItemsTreshold };
  }
}

export default decorate(Store, {
  tree: observable,
  hasMore: observable,
  setNewTree: action.bound,
  setCollapsed: action.bound,
  toggleCollapsed: action.bound,
  showNextPage: action.bound,
  setJsonPath: action.bound,
});
