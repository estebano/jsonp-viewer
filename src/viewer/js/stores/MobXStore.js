import { decorate, observable, action, set, toJS } from 'mobx';
import { set as _set, get as _get } from 'lodash';
import { stringify } from 'jsonpath';
import List from 'collections/list';
import shortid from 'shortid';

export const BoxingType = {
  array: 'array',
  object: 'object',
  primitive: 'primitive',
};

const BoxingWrapperTypeName = 'BoxingWrapper';

export const BoxingWrapper = (type) => {
  let self = {
    _id: shortid.generate(),
    typeName: BoxingWrapperTypeName,
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

function recursiveStructuralBoxing(obj) {
  let tree = undefined;
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      tree = BoxingWrapper(BoxingType.array);
      obj.forEach((element) => tree.value.push(recursiveStructuralBoxing(element)));
      tree.subNodesCount = tree.value.reduce((accumulator, item) => {
        return (accumulator += item.subNodesCount);
      }, obj.length);
    } else {
      tree = BoxingWrapper(BoxingType.object);

      Object.entries(obj).forEach(([key, propValue]) => {
        let boxingResult = recursiveStructuralBoxing(propValue);
        tree.value[key] = boxingResult;
        tree.subNodesCount += boxingResult.subNodesCount + 1;
      });
    }
  } else {
    tree = BoxingWrapper(BoxingType.primitive);
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
  tree = {};
  flatListOfNodes = null;
  hasMore = { value: true };
  visibleItemsTreshold = 0;
  visibleItemsCount = 0;
  currentListNode = null;

  constructor(json) {
    this.setNewTree(json);
  }

  async setNewTree(json) {
    let prep = recursiveStructuralBoxing(json);
    this.tree = observable.object(prep);
    this.flatListOfNodes = flatten(this.tree);
    this.currentListNode = this.flatListOfNodes.head.next;
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
});
