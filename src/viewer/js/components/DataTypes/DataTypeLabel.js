import React from 'react';

export default class extends React.PureComponent {
  render() {
    const { rjvId, type_name, displayDataTypes, cx, labeledStyles } = this.props;
    if (displayDataTypes) {
      return (
        <span className={cx('data-type-label', labeledStyles.dataTypeLabel)}>{type_name}</span>
      );
    }
    return null;
  }
}
