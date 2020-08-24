import React from 'react';
import DataTypeLabel from './DataTypeLabel';

export default class extends React.PureComponent {
  render() {
    const type_name = 'int';
    const { props } = this;
    return (
      <div className={props.cx(props.labeledStyles.integer)}>
        <DataTypeLabel type_name={type_name} {...props} />
        {this.props.value}
      </div>
    );
  }
}
