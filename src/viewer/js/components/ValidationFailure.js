import React from 'react';
import dispatcher from './../helpers/dispatcher';

import { Add as Clear } from './icons';

//this input appears when adding a new value to an object
export default class extends React.PureComponent {
  render() {
    const { message, active, cx, labeledStyles, rjvId } = this.props;

    return active ? (
      <div
        className={cx('validation-failure', labeledStyles.validationFailure)}
        onClick={() => {
          dispatcher.dispatch({
            rjvId: rjvId,
            name: 'RESET',
          });
        }}
      >
        <span className={cx(labeledStyles.validationFailureLabel)}>{message}</span>
        <Clear className={cx(labeledStyles.validationFailureClear)} />
      </div>
    ) : null;
  }
}
