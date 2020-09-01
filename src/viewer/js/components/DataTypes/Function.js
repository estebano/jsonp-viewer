import React from 'react';
import DataTypeLabel from './DataTypeLabel';

class Function extends React.PureComponent {
  toggleCollapsed = () => {
    this.props.src.isCollapsed = !this.props.src.isCollapsed;
  };

  render() {
    const type_name = 'function';
    const { props } = this;
    const { cx, labeledStyles, src } = this.props;

    return (
      <div className={cx(labeledStyles.function)}>
        <DataTypeLabel type_name={type_name} {...props} />
        <span
          className={cx('rjv-function-container', labeledStyles.functionValue)}
          onClick={this.toggleCollapsed}
        >
          {this.getFunctionDisplay(src.isCollapsed)}
        </span>
      </div>
    );
  }

  getFunctionDisplay = (collapsed) => {
    const { cx, labeledStyles, src } = this.props;
    if (collapsed) {
      return (
        <span>
          {src.value
            .toString()
            .slice(9, -1)
            .replace(/\{[\s\S]+/, '')}
          <span className='function-collapsed' style={{ fontWeight: 'bold' }}>
            <span>{'{'}</span>
            <span className={cx(labeledStyles.ellipsis)}>...</span>
            <span>{'}'}</span>
          </span>
        </span>
      );
    } else {
      return src.value.toString().slice(9, -1);
    }
  };
}

export default Function;
