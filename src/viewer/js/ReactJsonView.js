import React from 'react';
import JsonViewer from './components/JsonViewer';
import ValidationFailure from './components/ValidationFailure';
import { toType, isTheme } from './helpers/util';

//global theme
import { createControlLabeledStyles } from './themes/createStylist';
import { cx } from 'emotion';
import InfiniteScroller from 'react-infinite-scroller';

//some style behavior requires css
import './../style/scss/global.scss';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';

//forward src through to JsonObject component
class ReactJsonView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      //listen to request to add/edit a key to an object
      addKeyRequest: false,
      editKeyRequest: false,
      validationFailure: false,
      src: ReactJsonView.defaultProps.src,
      name: ReactJsonView.defaultProps.name,
      theme: ReactJsonView.defaultProps.theme,
      validationMessage: ReactJsonView.defaultProps.validationMessage,
      labeledStyles: createControlLabeledStyles(ReactJsonView.defaultProps.theme),
    };
  }

  //reference id for this instance
  rjvId = Date.now().toString();

  //all acceptable props and default values
  static defaultProps = {
    src: {},
    name: 'root',
    theme: 'rjv-default',
    collapsed: false,
    collapseStringsAfterLength: false,
    shouldCollapse: false,
    sortKeys: false,
    groupArraysAfterLength: 100,
    indentWidth: 4,
    enableClipboard: true,
    displayObjectSize: true,
    displayDataTypes: true,
    onEdit: false,
    onDelete: false,
    onAdd: false,
    onSelect: false,
    iconStyle: 'triangle',
    style: {},
    validationMessage: 'Validation Error',
    defaultValue: null,
  };

  // will trigger whenever setState() is called, or parent passes in new props.
  static getDerivedStateFromProps(nextProps, prevState) {
    const srcDiffers = nextProps.src !== prevState.src;
    const nameDiffers = nextProps.name !== prevState.nam;
    const themeDiffers = nextProps.theme !== prevState.theme;

    if (srcDiffers || nameDiffers || themeDiffers) {
      // if we pass in new props, we re-validate
      const newPartialState = {
        src: nextProps.src,
        name: nextProps.name,
        theme: nextProps.theme,
        validationMessage: nextProps.validationMessage,
        labeledStyles: themeDiffers
          ? createControlLabeledStyles(nextProps.theme)
          : prevState.labeledStyles,
      };
      return ReactJsonView.validateState(newPartialState);
    }
    return null;
  }

  componentDidMount() {
    //reset key request to false once it's observed
    this.setState({
      addKeyRequest: false,
      editKeyRequest: false,
    });
  }

  //make sure props are passed in as expected
  static validateState = (state) => {
    const validatedState = {};
    //make sure theme is valid
    if (toType(state.theme) === 'object' && !isTheme(state.theme)) {
      console.error(
        'react-json-view error:',
        'theme prop must be a theme name or valid base-16 theme object.',
        'defaulting to "rjv-default" theme'
      );
      validatedState.theme = 'rjv-default';
    }
    //make sure `src` prop is valid
    if (toType(state.src) !== 'object' && toType(state.src) !== 'array') {
      console.error('react-json-view error:', 'src property must be a valid json object');
      validatedState.name = 'ERROR';
      validatedState.src = {
        message: 'src property must be a valid json object',
      };
    }
    return {
      // get the original state
      ...state,
      // override the original state
      ...validatedState,
    };
  };

  loadFunction = () => {
    this.props.store.showNextPage();
  };

  onReset = () => {};

  render() {
    const { validationFailure, validationMessage, theme, src, name, labeledStyles } = this.state;

    const { style } = this.props;
    let hasMore = this.props.store.hasMore;
    console.log('hasMore', toJS(hasMore));

    return (
      // <div className='infinite-scroller' style={{ flex: '0 1 auto', overflow: 'auto' }}>
      <InfiniteScroller
        initialLoad={false}
        loadMore={this.loadFunction}
        hasMore={hasMore.value}
        threshold={860}
      >
        <div className={cx('react-json-view', labeledStyles.appContainer)} style={style}>
          <ValidationFailure
            message={validationMessage}
            active={validationFailure}
            theme={theme}
            rjvId={this.rjvId}
            labeledStyles={labeledStyles}
            cx={cx}
            onReset={this.onReset}
          />
          <JsonViewer
            {...this.props}
            src={src}
            name={name}
            theme={theme}
            type={toType(src)}
            rjvId={this.rjvId}
            labeledStyles={labeledStyles}
            cx={cx}
          />
        </div>
      </InfiniteScroller>
      // </div>
    );
  }
}

export default observer(ReactJsonView);
