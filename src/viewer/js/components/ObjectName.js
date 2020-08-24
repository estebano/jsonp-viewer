import React from 'react';
import Theme from '../themes/createStylist';

export default function getObjectName(props) {
  const { parent_type, namespace, jsvRoot, name, labeledStyles, cx } = props;

  const display_name = props.name ? props.name : '';

  if (jsvRoot && (name === false || name === null)) {
    return <span />;
  } else if (parent_type == 'array') {
    return (
      <span className={cx(labeledStyles.arrayKey)} key={namespace}>
        <span className='array-key'>{display_name}</span>
        <span className={cx(labeledStyles.colon)}>:</span>
      </span>
    );
  } else {
    return (
      <span className={cx(labeledStyles.objectName)} key={namespace}>
        <span className='object-key'>
          <span style={{ verticalAlign: 'top' }}>"</span>
          <span>{display_name}</span>
          <span style={{ verticalAlign: 'top' }}>"</span>
        </span>
        <span className={cx(labeledStyles.colon)}>:</span>
      </span>
    );
  }
}
