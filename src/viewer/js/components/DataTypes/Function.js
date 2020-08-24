import React from 'react';
import DataTypeLabel from './DataTypeLabel';

//attribute store for storing collapsed state
import AttributeStore from './../../stores/ObjectAttributes';

export default class extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: AttributeStore.get(props.rjvId, props.namespace, 'collapsed', true),
    };
  }

  toggleCollapsed = () => {
    this.setState(
      {
        collapsed: !this.state.collapsed,
      },
      () => {
        // will be called after setState takes effect.
        AttributeStore.set(
          this.props.rjvId,
          this.props.namespace,
          'collapsed',
          this.state.collapsed
        );
      }
    );
  };

  render() {
    const type_name = 'function';
    const { props } = this;
    const { cx, labeledStyles } = this.props;
    const { collapsed } = this.state;

    return (
      <div className={cx(labeledStyles.function)}>
        <DataTypeLabel type_name={type_name} {...props} />
        <span
          className={cx('rjv-function-container', labeledStyles.functionValue)}
          onClick={this.toggleCollapsed}
        >
          {this.getFunctionDisplay(collapsed)}
        </span>
      </div>
    );
  }

  getFunctionDisplay = (collapsed) => {
    const { props } = this;
    const { cx, labeledStyles } = this.props;
    if (collapsed) {
      return (
        <span>
          {this.props.value
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
      return this.props.value.toString().slice(9, -1);
    }
  };
}
