import React from 'react';

import CopyToClipboard from './CopyToClipboard';
import { toType } from './../helpers/util';

//icons
import { RemoveCircle as Remove, AddCircle as Add } from './icons';

export default class extends React.PureComponent {
  getObjectSize = () => {
    const { size, cx, labeledStyles, displayObjectSize } = this.props;
    if (displayObjectSize) {
      return (
        <span className={cx('object-size', labeledStyles.objectSize)}>
          {size} item{size === 1 ? '' : 's'}
        </span>
      );
    }
  };

  getAddAttribute = () => {
    const { cx, labeledStyles, namespace, name, src, rjvId, depth } = this.props;

    return (
      <span className='click-to-add' style={{ verticalAlign: 'top' }}>
        <Add
          className={cx('click-to-add-icon', labeledStyles.addVarIcon)}
          onClick={() => {
            const request = {
              name: depth > 0 ? name : null,
              namespace: namespace.splice(0, namespace.length - 1),
              existing_value: src,
              variable_removed: false,
              key_name: null,
            };
            if (toType(src) === 'object') {
            } else {
            }
          }}
        />
      </span>
    );
  };

  getRemoveObject = () => {
    const { cx, labeledStyles, namespace } = this.props;

    //don't allow deleting of root node
    if (namespace.length === 1) {
      return;
    }
    return (
      <span className='click-to-remove'>
        <Remove
          className={cx('click-to-remove-icon', labeledStyles.removeVarIcon)}
          onClick={() => {}}
        />
      </span>
    );
  };

  render = () => {
    const { cx, labeledStyles, onDelete, onAdd, enableClipboard, src, namespace } = this.props;
    return (
      <div
        className={cx('object-meta-data', labeledStyles.objectMetaData)}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* size badge display */}
        {this.getObjectSize()}
        {/* copy to clipboard icon */}
        {enableClipboard ? (
          <CopyToClipboard clickCallback={enableClipboard} {...{ src, namespace }} />
        ) : null}
        {/* copy add/remove icons */}
        {onAdd !== false ? this.getAddAttribute() : null}
        {onDelete !== false ? this.getRemoveObject() : null}
      </div>
    );
  };
}
