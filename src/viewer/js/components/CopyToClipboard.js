import React from 'react';

import { toType } from './../helpers/util';
import stringifyVariable from './../helpers/stringifyVariable';

//clibboard icon
import { Clippy } from './icons';

export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
    };
  }

  copiedTimer = null;

  componentWillUnmount() {
    if (this.copiedTimer) {
      clearTimeout(this.copiedTimer);
      this.copiedTimer = null;
    }
  }

  handleCopy = () => {
    const container = document.createElement('textarea');
    const { clickCallback, src, namespace } = this.props;

    container.innerHTML = JSON.stringify(this.clipboardValue(src), null, '  ');

    document.body.appendChild(container);
    container.select();
    document.execCommand('copy');

    document.body.removeChild(container);

    this.copiedTimer = setTimeout(() => {
      this.setState({
        copied: false,
      });
    }, 5500);

    this.setState({ copied: true }, () => {
      if (typeof clickCallback !== 'function') {
        return;
      }

      clickCallback({
        src: src,
        namespace: namespace,
        name: namespace[namespace.length - 1],
      });
    });
  };

  getClippyIcon = () => {
    const { cx, labeledStyles } = this.props;
    if (this.state.copied) {
      return (
        <span>
          <Clippy className={cx('copy-icon', labeledStyles.copyIcon)} />
          <span className={cx(labeledStyles.copuIconCopied)}>✔</span>
        </span>
      );
    }

    return <Clippy className={cx('copy-icon', labeledStyles.copyIcon)} />;
  };

  clipboardValue = (value) => {
    const type = toType(value);
    switch (type) {
      case 'function':
      case 'regexp':
        return value.toString();
      default:
        return value;
    }
  };

  render() {
    const { src, hidden, cx, labeledStyles } = this.props;
    let display = 'inline';

    if (hidden) {
      display = 'none';
    }

    return (
      <span className='copy-to-clipboard-container' title='Copy to clipboard'>
        <span
          className={cx(labeledStyles.copyToClipboard)}
          style={{
            display: display,
          }}
          onClick={this.handleCopy}
        >
          {this.getClippyIcon()}
        </span>
      </span>
    );
  }
}
