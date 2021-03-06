import React from 'react';
import { Theme } from './../themes/createStylist';

import VariableMeta from './VariableMeta';
import ObjectName from './ObjectName';
import JsonObject from './DataTypes/JsonObject';

//icons
import { CollapsedIcon, ExpandedIcon } from './ToggleIcons';
import { observer } from 'mobx-react';

//single indent is 5px
const SINGLE_INDENT = 5;

class ArrayGroup extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: [],
    };
  }

  toggleCollapsed = (i) => {
    const newExpanded = [];
    for (const j in this.state.expanded) {
      newExpanded.push(this.state.expanded[j]);
    }
    newExpanded[i] = !newExpanded[i];
    this.setState({
      expanded: newExpanded,
    });
  };

  getExpandedIcon(i) {
    const { theme, iconStyle, cx, labeledStyles } = this.props;

    if (this.state.expanded[i]) {
      return <ExpandedIcon {...{ theme, iconStyle, cx, labeledStyles }} />;
    }

    return <CollapsedIcon {...{ theme, iconStyle, cx, labeledStyles }} />;
  }

  render() {
    const {
      src,
      groupArraysAfterLength,
      depth,
      name,
      theme,
      jsvRoot,
      namespace,
      parent_type,
      labeledStyles,
      cx,
      ...rest
    } = this.props;

    if (!src.isVisible) return null;

    let expanded_icon,
      object_padding_left = 0;

    const array_group_padding_left = this.props.indentWidth * SINGLE_INDENT;

    if (!jsvRoot) {
      object_padding_left = this.props.indentWidth * SINGLE_INDENT;
    }

    const size = groupArraysAfterLength;
    const groups = Math.ceil(src.value.length / size);
    return (
      <div
        className='object-key-val'
        {...Theme(theme, jsvRoot ? 'jsv-root' : 'objectKeyVal', {
          paddingLeft: object_padding_left,
        })}
      >
        <ObjectName {...this.props} />

        <span>
          <VariableMeta size={src.value.length} {...this.props} />
        </span>
        {[...Array(groups)].map((_, i) => {
          return (
            <div
              key={i}
              className={cx('object-key-val', 'array-group', labeledStyles.objectKeyVal)}
              style={{
                marginLeft: 6,
                paddingLeft: array_group_padding_left,
              }}
            >
              <span className={cx(labeledStyles.braceRow)}>
                <div
                  className={cx('icon-container', labeledStyles.iconContainer)}
                  onClick={(e) => {
                    this.toggleCollapsed(i);
                  }}
                >
                  {this.getExpandedIcon(i)}
                </div>
                {this.state.expanded[i] ? (
                  <JsonObject
                    key={name + i}
                    depth={0}
                    name={false}
                    collapsed={false}
                    groupArraysAfterLength={size}
                    index_offset={i * size}
                    src={src.slice.call(src, i * size, i * size + size)}
                    namespace={namespace}
                    type='array'
                    parent_type='array_group'
                    cx={cx}
                    labeledStyles={labeledStyles}
                    theme={theme}
                    {...rest}
                  />
                ) : (
                  <span
                    onClick={(e) => {
                      this.toggleCollapsed(i);
                    }}
                    className={cx('array-group-brace', labeledStyles.brace)}
                  >
                    [
                    <div className={cx('array-group-meta-data', labeledStyles.arrayGroupMetaData)}>
                      <span className={cx('object-size', labeledStyles.objectSize)}>
                        {' '}
                        {'>'}
                        {i * size}
                        {' - '}
                        {i * size + size > src.value.length ? src.value.length : i * size + size}
                      </span>
                    </div>
                    ]
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default observer(ArrayGroup);
