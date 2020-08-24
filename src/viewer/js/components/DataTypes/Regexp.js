import React from 'react';
import DataTypeLabel from './DataTypeLabel';

//theme
import Theme from '../../themes/createStylist';

export default class extends React.PureComponent {
  render() {
    const type_name = 'regexp';
    const { props } = this;
    const { cx, labeledStyles } = this.props;
    return (
      <div className={cx(labeledStyles.regexp)}>
        <DataTypeLabel type_name={type_name} {...props} />
        {this.props.value.toString()}
      </div>
    );
  }
}
