import React from 'react';

import { CircleMinus, CirclePlus, SquareMinus, SquarePlus, ArrowRight, ArrowDown } from './icons';

export function ExpandedIcon(props) {
  const { cx, labeledStyles, iconStyle } = props;
  switch (iconStyle) {
    case 'triangle':
      return <ArrowDown className={cx('expanded-icon', labeledStyles.expandedIcon)} />;
    case 'square':
      return <SquareMinus className={cx('expanded-icon', labeledStyles.expandedIcon)} />;
    default:
      return <CircleMinus className={cx('expanded-icon', labeledStyles.expandedIcon)} />;
  }
}

export function CollapsedIcon(props) {
  const { cx, labeledStyles, iconStyle } = props;
  switch (iconStyle) {
    case 'triangle':
      return <ArrowRight className={cx('collapsed-icon', labeledStyles.collapsedIcon)} />;
    case 'square':
      return <SquarePlus className={cx('collapsed-icon', labeledStyles.collapsedIcon)} />;
    default:
      return <CirclePlus className={cx('collapsed-icon', labeledStyles.collapsedIcon)} />;
  }
}
