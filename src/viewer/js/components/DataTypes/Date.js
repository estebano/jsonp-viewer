import React from 'react';
import DataTypeLabel from './DataTypeLabel';

export default class extends React.PureComponent {
  render() {
    const type_name = 'date';
    const { props } = this;
    const { cx, labeledStyles } = props;
    const display_options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return (
      <div className={cx(labeledStyles.date)}>
        <DataTypeLabel type_name={type_name} {...props} />
        <span className={cx('date-value', labeledStyles.dateValue)}>
          {props.value.toLocaleTimeString('en-us', display_options)}
        </span>
      </div>
    );
  }
}
