import React from 'react';
import dispatcher from './../../helpers/dispatcher';

import { CheckCircle, Add as Cancel } from './../icons';

//this input appears when adding a new value to an object
export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      input: props.input ? props.input : '',
    };
  }

  render() {
    const { cx, labeledStyles, rjvId, isValid } = this.props;
    const { input } = this.state;

    const valid = isValid(input);

    return (
      <div
        className={cx('key-modal-request', labeledStyles['key-modal-request'])}
        onClick={this.closeModal}
      >
        <div
          className={cx(labeledStyles['key-modal'])}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className={cx(labeledStyles['key-modal-label'])}>Key Name:</div>
          <div style={{ position: 'relative' }}>
            <input
              className={cx('key-modal-input', labeledStyles['key-modal-input'])}
              ref={(el) => el && el.focus()}
              spellCheck={false}
              value={input}
              placeholder='...'
              onChange={(e) => {
                this.setState({
                  input: e.target.value,
                });
              }}
              onKeyPress={(e) => {
                if (valid && e.key === 'Enter') {
                  this.submit();
                } else if (e.key === 'Escape') {
                  this.closeModal();
                }
              }}
            />
            {valid ? (
              <CheckCircle
                className={cx('key-modal-submit', labeledStyles['key-modal-submit'])}
                onClick={(e) => this.submit()}
              />
            ) : null}
          </div>
          <span className={cx(labeledStyles['key-modal-cancel'])}>
            <Cancel
              className={cx('key-modal-cancel', labeledStyles['key-modal-cancel-icon'])}
              onClick={() => {
                dispatcher.dispatch({
                  rjvId: rjvId,
                  name: 'RESET',
                });
              }}
            />
          </span>
        </div>
      </div>
    );
  }

  closeModal = () => {
    dispatcher.dispatch({
      rjvId: this.props.rjvId,
      name: 'RESET',
    });
  };

  submit = () => {
    this.props.submit(this.state.input);
  };
}
