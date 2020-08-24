import React from 'react';

//theme
import Theme from '../../themes/createStylist';

export default class extends React.PureComponent {
  render() {
    const { cx, labeledStyles } = this.props;
    return <div className={cx(labeledStyles.null)}>NULL</div>;
  }
}
