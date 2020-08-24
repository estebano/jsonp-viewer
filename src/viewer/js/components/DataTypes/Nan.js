import React from 'react';

export default class extends React.PureComponent {
  render() {
    const { cx, labeledStyles } = this.props;
    return <div className={cx(labeledStyles.nan)}>NaN</div>;
  }
}
