import React from 'react';
import DataTypeLabel from './DataTypeLabel';

export default class extends React.PureComponent {
  render() {
    const type_name = 'bool';
    const { props } = this;
    const { cx, labeledStyles } = props;

    return (
      <div className={cx(labeledStyles.boolean)}>
        <DataTypeLabel type_name={type_name} {...props} />
        {props.value ? 'true' : 'false'}
      </div>
    );
  }
}
