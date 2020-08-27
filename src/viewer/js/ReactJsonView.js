import React from 'react';
import JsonViewer from './components/JsonViewer';
import AddKeyRequest from './components/ObjectKeyModal/AddKeyRequest';
import ValidationFailure from './components/ValidationFailure';
import { toType, isTheme } from './helpers/util';
import ObjectAttributes from './stores/ObjectAttributes';

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
    // initialize
    ObjectAttributes.set(this.rjvId, 'global', 'src', this.state.src);
    // bind to events
    const listeners = this.getListeners();
    for (const i in listeners) {
      ObjectAttributes.on(i + '-' + this.rjvId, listeners[i]);
    }
    //reset key request to false once it's observed
    this.setState({
      addKeyRequest: false,
      editKeyRequest: false,
    });

    console.log(
      'performance',
      performance.getEntriesByType('measure').reduce((val, current, index) => {
        return val + current.duration;
      }, 0)
    );

    this.props.store.showNextPage(300);
  }

  componentDidUpdate(prevProps, prevState) {
    // // // //reset key request to false once it's observed
    // // // if (prevState.addKeyRequest !== false) {
    // // //   this.setState({
    // // //     addKeyRequest: false,
    // // //   });
    // // // }
    // // // if (prevState.editKeyRequest !== false) {
    // // //   this.setState({
    // // //     editKeyRequest: false,
    // // //   });
    // // // }
    // // // if (prevProps.src !== this.state.src) {
    // // //   ObjectAttributes.set(this.rjvId, 'global', 'src', this.state.src);
    // // // }
  }

  componentWillUnmount() {
    const listeners = this.getListeners();
    for (const i in listeners) {
      ObjectAttributes.removeListener(i + '-' + this.rjvId, listeners[i]);
    }
  }

  getListeners = () => {
    return {
      reset: this.resetState,
      'variable-update': this.updateSrc,
      'add-key-request': this.addKeyRequest,
    };
  };
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

  render() {
    const {
      validationFailure,
      validationMessage,
      addKeyRequest,
      theme,
      src,
      name,
      labeledStyles,
    } = this.state;

    const { style, defaultValue } = this.props;
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
          <AddKeyRequest
            active={addKeyRequest}
            theme={theme}
            rjvId={this.rjvId}
            defaultValue={defaultValue}
            labeledStyles={labeledStyles}
            cx={cx}
          />
        </div>
      </InfiniteScroller>
      // </div>
    );
  }

  updateSrc = () => {
    const {
      name,
      namespace,
      new_value,
      existing_value,
      variable_removed,
      updated_src,
      type,
    } = ObjectAttributes.get(this.rjvId, 'action', 'variable-update');
    const { onEdit, onDelete, onAdd } = this.props;

    const { src } = this.state;

    let result;

    const on_edit_payload = {
      existing_src: src,
      new_value: new_value,
      updated_src: updated_src,
      name: name,
      namespace: namespace,
      existing_value: existing_value,
    };

    switch (type) {
      case 'variable-added':
        result = onAdd(on_edit_payload);
        break;
      case 'variable-edited':
        result = onEdit(on_edit_payload);
        break;
      case 'variable-removed':
        result = onDelete(on_edit_payload);
        break;
      default:
        throw new Error('default stub');
    }

    if (result !== false) {
      ObjectAttributes.set(this.rjvId, 'global', 'src', updated_src);
      this.setState({
        src: updated_src,
      });
    } else {
      this.setState({
        validationFailure: true,
      });
    }
  };

  addKeyRequest = () => {
    this.setState({
      addKeyRequest: true,
    });
  };

  resetState = () => {
    this.setState({
      validationFailure: false,
      addKeyRequest: false,
    });
  };
}

export default observer(ReactJsonView);
