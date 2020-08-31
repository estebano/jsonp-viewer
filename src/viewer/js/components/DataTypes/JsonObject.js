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
import { Theme } from '../../themes/createStylist';
import { observer } from 'mobx-react';
import { toJS, trace } from 'mobx';
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
    const { src } = props;
    const size = Object.keys(src.value).length;
    const expanded =
      (props.collapsed === false || (props.collapsed !== true && props.collapsed > props.depth)) &&
      (!props.shouldCollapse ||
        props.shouldCollapse({
          name: props.name,
          src: src,
          type: toType(src.value),
          namespace: src.namespace,
        }) === false) &&
      //initialize closed if object has no items
      size !== 0;
    const state = {
      expanded: !src.isCollapsed,
      isMatched: src.isMatched,
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
        this.props.src.isCollapsed = !this.state.expanded;
      }
    );
  };

  getObjectContent = (depth, value, args) => {
    const { cx, labeledStyles } = this.props;
    return (
      <div className={cx('pushed-content', 'object-container', { 'cls-hidden': args.hidden })}>
        <div className={cx('object-content', labeledStyles.objectContent)}>
          {this.renderObjectContents(value, args)}
        </div>
      </div>
    );
  };

  getEllipsis = (expanded) => {
    const { size } = this.state;
    const { cx, labeledStyles } = this.props;

    if (size === 0) {
      //don't render an ellipsis when an object has no items
      return null;
    } else {
      return (
        <div
          className={cx('node-ellipsis', labeledStyles.ellipsis, { 'cls-hidden': expanded })}
          onClick={this.toggleCollapsed}
        >
          ...
        </div>
      );
    }
  };

  getObjectMetaData = (src) => {
    const { rjvId } = this.props;
    const { size } = this.state;
    return <VariableMeta size={size} {...this.props} />;
  };

  getBraceStart(object_type, expanded) {
    const { src, iconStyle, parent_type, cx, labeledStyles } = this.props;

    if (parent_type === 'array_group') {
      return (
        <span>
          <span className={cx(labeledStyles.brace)}>{object_type === 'array' ? '[' : '{'}</span>
          {expanded ? this.getObjectMetaData(src) : null}
        </span>
      );
    }

    const IconComponent = expanded ? ExpandedIcon : CollapsedIcon;

    return (
      <span>
        <span
          className={cx(labeledStyles.braceRow)}
          onClick={(e) => {
            this.toggleCollapsed();
          }}
        >
          <div className={cx('icon-container', labeledStyles.iconContainer)}>
            <IconComponent iconStyle={iconStyle} cx={cx} labeledStyles={labeledStyles} />
          </div>
          <ObjectName {...this.props} />
          <span className={cx(labeledStyles.brace)}>{object_type === 'array' ? '[' : '{'}</span>
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
      name,
      type,
      parent_type,
      cx,
      labeledStyles,
      jsvRoot,
      iconStyle,
      theme,
      ...rest
    } = this.props;

    if (!src.isVisible) return null;

    const { object_type, expanded } = this.state;
    const isMatched = src.isMatched;

    let styles = {};
    if (!jsvRoot && parent_type !== 'array_group') {
      styles.paddingLeft = this.props.indentWidth * SINGLE_INDENT;
    } else if (parent_type === 'array_group') {
      styles.borderLeft = 0;
      styles.display = 'inline';
    }

    if (depth === 1) {
      trace();
    }
    return (
      <div
        className={cx('object-key-val', { 'is-matched': isMatched })}
        {...Theme(theme, jsvRoot ? 'jsv-root' : 'objectKeyVal', styles)}
      >
        {this.getBraceStart(object_type, expanded)}
        {this.getObjectContent(depth, src.value, {
          ...rest,
          iconStyle,
          cx,
          labeledStyles,
          theme,
          hidden: !expanded,
        })}
        {this.getEllipsis(expanded)}
        <span className='brace-row'>
          <span
            className={cx(labeledStyles.brace)}
            style={{
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

  renderObjectContents = (variables, args) => {
    const { depth, parent_type, index_offset, groupArraysAfterLength, src } = this.props;
    const { object_type } = this.state;
    const { hidden, ...restArgs } = args;
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
      if (variable.type === 'object') {
        elements.push(
          <JsonObject
            {...restArgs}
            key={variable.name}
            depth={depth + DEPTH_INCREMENT}
            name={variable.name}
            src={variable.value}
            parent_type={object_type}
          />
        );
      } else if (variable.type === 'array') {
        let ObjectComponent = JsonObject;

        if (groupArraysAfterLength && variable.value.value.length > groupArraysAfterLength) {
          ObjectComponent = ArrayGroup;
        }

        elements.push(
          <ObjectComponent
            {...restArgs}
            key={variable.name}
            depth={depth + DEPTH_INCREMENT}
            name={variable.name}
            src={variable.value}
            type='array'
            parent_type={object_type}
          />
        );
      } else {
        elements.push(
          <VariableEditor
            {...restArgs}
            key={name + '_' + src.namespace}
            name={name}
            src={variables[name]}
            singleIndent={SINGLE_INDENT}
            type={this.props.type}
            isMatched={variable.isMatched}
            namespace={src.namespace}
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
    this.isPrimitive = value.type === 'primitive';
    this.isVisible = value.isVisible;
    this.isMatched = value.isMatched;
    this.name = name;
    this.value = this.isPrimitive ? toJS(value.value) : value;
    this.type = this.isPrimitive ? toType(toJS(value.value)) : value.type;
  }
}

//export component
export default observer(JsonObject);
