import React from 'react';

import { Add as Clear } from './icons';

//this input appears when adding a new value to an object
export default class extends React.PureComponent {
  render() {
    const { message, active, cx, labeledStyles, onReset } = this.props;

    return active ? (
      <div className={cx('validation-failure', labeledStyles.validationFailure)} onClick={onReset}>
        <span className={cx(labeledStyles.validationFailureLabel)}>{message}</span>
        <Clear className={cx(labeledStyles.validationFailureClear)} />
      </div>
    ) : null;
  }
}
