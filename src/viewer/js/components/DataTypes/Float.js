import React from 'react';
import DataTypeLabel from './DataTypeLabel';

export default class extends React.PureComponent {
  render() {
    const type_name = 'float';
    const { cx, labeledStyles } = this.props;
    return (
      <div className={cx(labeledStyles.float)}>
        <DataTypeLabel type_name={type_name} {...this.props} />
        {this.props.value}
      </div>
    );
  }
}
