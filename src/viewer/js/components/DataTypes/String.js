import React from 'react';
import DataTypeLabel from './DataTypeLabel';
import { toType } from './../../helpers/util';

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
    const type_name = 'string';
    const { collapsed } = this.state;
    const { props } = this;
    const { collapseStringsAfterLength, cx, labeledStyles } = props;
    let { value } = props;
    let collapsible = toType(collapseStringsAfterLength) === 'integer';
    let style = { style: { cursor: 'default' } };

    if (collapsible && value.length > collapseStringsAfterLength) {
      style.style.cursor = 'pointer';
      if (this.state.collapsed) {
        value = (
          <span>
            {value.substring(0, collapseStringsAfterLength)}
            <span className={cx(labeledStyles.ellipsis)}> ...</span>
          </span>
        );
      }
    }

    return (
      <div className={cx(labeledStyles.string)}>
        <DataTypeLabel type_name={type_name} {...props} />
        <span className='string-value' {...style} onClick={this.toggleCollapsed}>
          "{value}"
        </span>
      </div>
    );
  }
}
