import React from 'react';
import DataTypeLabel from './DataTypeLabel';
import { toType } from './../../helpers/util';
import { observer } from 'mobx-react';

class Strings extends React.PureComponent {
  toggleCollapsed = () => {
    this.props.src.isCollapsed = !this.props.src.isCollapsed;
  };

  render() {
    const type_name = 'string';
    const { props } = this;
    const { collapseStringsAfterLength, cx, labeledStyles, src } = props;
    let collapsible = toType(collapseStringsAfterLength) === 'integer';
    let style = { style: { cursor: 'default' } };
    let value = src.value;
    if (collapsible && value.length > collapseStringsAfterLength) {
      style.style.cursor = 'pointer';
      if (src.isCollapsed) {
        value = (
          <span>
            {value.substring(0, collapseStringsAfterLength)}
            <span className={cx(labeledStyles.ellipsis)}> ...</span>
          </span>
        );
      }
    }

    return (
      <div className={cx(labeledStyles.string)}>
        <DataTypeLabel type_name={type_name} {...props} />
        <span className='string-value' {...style} onClick={this.toggleCollapsed}>
          "{value}"
        </span>
      </div>
    );
  }
}

export default observer(Strings);
