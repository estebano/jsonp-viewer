import React from 'react';
import { toType } from '../../helpers/util';

//data type components

import VariableEditor from '../VariableEditor';
import VariableMeta from '../VariableMeta';
import ArrayGroup from '../ArrayGroup';
import ObjectName from '../ObjectName';

//attribute store
import AttributeStore from '../../stores/ObjectAttributes';

//icons
import { CollapsedIcon, ExpandedIcon } from '../ToggleIcons';

//theme
import Theme from '../../themes/getStyle';
import { observer } from 'mobx-react';
import { get as _get } from 'lodash';
import { get, toJS } from 'mobx';
import { stringify } from 'jsonpath';
import { useIsFocusVisible } from '@material-ui/core';

//increment 1 with each nested object & array
const DEPTH_INCREMENT = 1;
//single indent is 5px
const SINGLE_INDENT = 5;

class JsonObject extends React.PureComponent {
  constructor(props) {
    super(props);
    const state = JsonObject.getState(props);
    this.state = {
      ...state,
      prevProps: {},
    };
  }

  static getState = (props) => {
    const { store, namespace } = props;
    if (!props.src.value) debugger;
    const size = Object.keys(props.src.value).length;
    const expanded =
      (props.collapsed === false || (props.collapsed !== true && props.collapsed > props.depth)) &&
      (!props.shouldCollapse ||
        props.shouldCollapse({
          name: props.name,
          src: props.src,
          type: toType(props.src),
          namespace: props.namespace,
        }) === false) &&
      //initialize closed if object has no items
      size !== 0;
    const state = {
      expanded:
        namespace.length === 1
          ? !store.tree.isCollapsed
          : (() => {
              let v = !_get(store.tree, namespace.slice(1).push('isCollapsed'));
              debugger;
              return v;
            })(),
      // AttributeStore.get(props.rjvId, props.namespace, 'expanded', expanded),
      object_type: props.type === 'array' ? 'array' : 'object',
      parent_type: props.type === 'array' ? 'array' : 'object',
      size,
    };
    return state;
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prevProps } = prevState;
    if (
      nextProps.src !== prevProps.src ||
      nextProps.collapsed !== prevProps.collapsed ||
      nextProps.name !== prevProps.name ||
      nextProps.namespace !== prevProps.namespace ||
      nextProps.rjvId !== prevProps.rjvId
    ) {
      const newState = JsonObject.getState(nextProps);
      return {
        ...newState,
        prevProps: nextProps,
      };
    }
    return null;
  }

  toggleCollapsed = () => {
    this.setState(
      {
        expanded: !this.state.expanded,
      },
      () => {
        AttributeStore.set(this.props.rjvId, this.props.namespace, 'expanded', this.state.expanded);
        this.props.store.toggleCollapsed(this.props.namespace);
      }
    );
  };

  getObjectContent = (depth, src, props) => {
    return (
      <div class='pushed-content object-container'>
        <div class='object-content' {...Theme(this.props.theme, 'pushed-content')}>
          {this.renderObjectContents(src, props)}
        </div>
      </div>
    );
  };

  getEllipsis = () => {
    const { size } = this.state;

    if (size === 0) {
      //don't render an ellipsis when an object has no items
      return null;
    } else {
      return (
        <div
          {...Theme(this.props.theme, 'ellipsis')}
          class='node-ellipsis'
          onClick={this.toggleCollapsed}
        >
          ...
        </div>
      );
    }
  };

  getObjectMetaData = (src) => {
    const { rjvId, theme } = this.props;
    const { size } = this.state;
    return <VariableMeta size={size} {...this.props} />;
  };

  getBraceStart(object_type, expanded) {
    const { src, theme, iconStyle, parent_type } = this.props;

    if (parent_type === 'array_group') {
      return (
        <span>
          <span {...Theme(theme, 'brace')}>{object_type === 'array' ? '[' : '{'}</span>
          {expanded ? this.getObjectMetaData(src) : null}
        </span>
      );
    }

    const IconComponent = expanded ? ExpandedIcon : CollapsedIcon;

    return (
      <span>
        <span
          onClick={(e) => {
            this.toggleCollapsed();
          }}
          {...Theme(theme, 'brace-row')}
        >
          <div class='icon-container' {...Theme(theme, 'icon-container')}>
            <IconComponent {...{ theme, iconStyle }} />
          </div>
          <ObjectName {...this.props} />
          <span {...Theme(theme, 'brace')}>{object_type === 'array' ? '[' : '{'}</span>
        </span>
        {expanded ? this.getObjectMetaData(src) : null}
      </span>
    );
  }

  render() {
    // `indentWidth` and `collapsed` props will
    // perpetuate to children via `...rest`
    const {
      depth,
      src,
      namespace,
      name,
      type,
      parent_type,
      theme,
      jsvRoot,
      iconStyle,
      ...rest
    } = this.props;

    const { object_type, expanded } = this.state;

    console.log('Inside JsonObject props', this.props);
    try {
      let pathx = namespace.slice(1);
      console.log('pathx', pathx);
      let ax = _get(rest.store.tree, stringify(pathx));
      let tmp = namespace.length > 1 ? ax : rest.store.tree;
      console.log('store rerender', tmp);
    } catch (e) {
      console.warn(e);
    }

    let styles = {};
    if (!jsvRoot && parent_type !== 'array_group') {
      styles.paddingLeft = this.props.indentWidth * SINGLE_INDENT;
    } else if (parent_type === 'array_group') {
      styles.borderLeft = 0;
      styles.display = 'inline';
    }

    return (
      <div class='object-key-val' {...Theme(theme, jsvRoot ? 'jsv-root' : 'objectKeyVal', styles)}>
        {this.getBraceStart(object_type, expanded)}
        {expanded
          ? this.getObjectContent(depth, src.value, {
              theme,
              iconStyle,
              ...rest,
            })
          : this.getEllipsis()}
        <span class='brace-row'>
          <span
            style={{
              ...Theme(theme, 'brace').style,
              paddingLeft: expanded ? '3px' : '0px',
            }}
          >
            {object_type === 'array' ? ']' : '}'}
          </span>
          {expanded ? null : this.getObjectMetaData(src.value)}
        </span>
      </div>
    );
  }

  renderObjectContents = (variables, props) => {
    const { depth, parent_type, index_offset, groupArraysAfterLength, namespace } = this.props;
    const { object_type } = this.state;
    let theme = props.theme;
    let elements = [],
      variable;
    let keys = Object.keys(variables || {});
    if (this.props.sortKeys) {
      keys = keys.sort();
    }
    keys.forEach((name) => {
      variable = new JsonVariable(name, variables[name]);

      if (parent_type === 'array_group' && index_offset) {
        variable.name = parseInt(variable.name) + index_offset;
      }
      if (!variables.hasOwnProperty(name)) {
        return;
      } else if (variable.type === 'object') {
        elements.push(
          <JsonObject
            {...props}
            key={variable.name}
            depth={depth + DEPTH_INCREMENT}
            name={variable.name}
            src={variable.value}
            namespace={namespace.concat(['value', variable.name])}
            parent_type={object_type}
          />
        );
      } else if (variable.type === 'array') {
        let ObjectComponent = JsonObject;

        if (groupArraysAfterLength && variable.value.length > groupArraysAfterLength) {
          ObjectComponent = ArrayGroup;
        }

        elements.push(
          <ObjectComponent
            key={variable.name}
            depth={depth + DEPTH_INCREMENT}
            name={variable.name}
            src={variable.value}
            namespace={namespace.concat(['value', variable.name])}
            type='array'
            parent_type={object_type}
            {...props}
          />
        );
      } else {
        elements.push(
          <VariableEditor
            key={variable.name + '_' + namespace}
            variable={variable}
            singleIndent={SINGLE_INDENT}
            namespace={namespace}
            type={this.props.type}
            {...props}
          />
        );
      }
    });
    return elements;
  };
}

//just store name, value and type with a variable
class JsonVariable {
  constructor(name, value) {
    let isPrimitive = value.type === 'primitive';
    this.name = name;
    this.value = isPrimitive ? toJS(value.value) : value;
    this.type = toType(isPrimitive ? toJS(value.value) : value);
  }
}

//export component
export default observer(JsonObject);
