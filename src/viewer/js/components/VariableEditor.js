import React from 'react';
import AutosizeTextarea from 'react-textarea-autosize';

import { toType } from './../helpers/util';
import dispatcher from './../helpers/dispatcher';
import parseInput from './../helpers/parseInput';
import stringifyVariable from './../helpers/stringifyVariable';
import CopyToClipboard from './CopyToClipboard';

//data type components
import {
  JsonBoolean,
  JsonDate,
  JsonFloat,
  JsonFunction,
  JsonInteger,
  JsonNan,
  JsonNull,
  JsonRegexp,
  JsonString,
  JsonUndefined,
} from './DataTypes/DataTypes';

//clibboard icon
import { Edit, CheckCircle, RemoveCircle as Remove } from './icons';

//theme
import { Theme } from './../themes/createStylist';

class VariableEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      editValue: '',
      renameKey: false,
      parsedInput: {
        type: false,
        value: null,
      },
    };
  }

  render() {
    const {
      variable,
      src,
      singleIndent,
      type,
      theme,
      namespace,
      indentWidth,
      enableClipboard,
      onEdit,
      onDelete,
      onSelect,
      rjvId,
      cx,
      labeledStyles,
    } = this.props;
    const { editMode } = this.state;

    return (
      <div
        {...Theme(theme, 'objectKeyVal', {
          paddingLeft: indentWidth * singleIndent,
        })}
        className='variable-row'
        key={variable.name}
      >
        {type == 'array' ? (
          <span className={cx(labeledStyles.arrayKey)} key={variable.name + '_' + namespace}>
            {variable.name}
            <div className={cx(labeledStyles.colon)}>:</div>
          </span>
        ) : (
          <span>
            <span
              className={cx('object-key', labeledStyles.objectName)}
              key={variable.name + '_' + namespace}
            >
              <span style={{ verticalAlign: 'top' }}>"</span>
              <span style={{ display: 'inline-block' }}>{variable.name}</span>
              <span style={{ verticalAlign: 'top' }}>"</span>
            </span>
            <span className={cx(labeledStyles.colon)}>:</span>
          </span>
        )}
        <div
          className='variable-value'
          onClick={
            onSelect === false && onEdit === false
              ? null
              : (e) => {
                  let location = [...namespace];
                  if ((e.ctrlKey || e.metaKey) && onEdit !== false) {
                    this.prepopInput(variable);
                  } else if (onSelect !== false) {
                    location.shift();
                    onSelect({
                      ...variable,
                      namespace: location,
                    });
                  }
                }
          }
          {...Theme(theme, 'variableValue', {
            cursor: onSelect === false ? 'default' : 'pointer',
          })}
        >
          {this.getValue(variable, editMode)}
        </div>
        {enableClipboard ? (
          <CopyToClipboard
            hidden={editMode}
            src={variable.value}
            clickCallback={enableClipboard}
            namespace={namespace}
          />
        ) : null}
        {onEdit !== false && editMode == false ? this.getEditIcon() : null}
        {onDelete !== false && editMode == false ? this.getRemoveIcon() : null}
      </div>
    );
  }

  getEditIcon = () => {
    const { variable, cx, labeledStyles } = this.props;

    return (
      <div className='click-to-edit' style={{ verticalAlign: 'top' }}>
        <Edit
          className={cx('click-to-edit-icon', labeledStyles.editVarIcon)}
          onClick={() => {
            this.prepopInput(variable);
          }}
        />
      </div>
    );
  };

  prepopInput = (variable) => {
    if (this.props.onEdit !== false) {
      const stringifiedValue = stringifyVariable(variable.value);
      const detected = parseInput(stringifiedValue);
      this.setState({
        editMode: true,
        editValue: stringifiedValue,
        parsedInput: {
          type: detected.type,
          value: detected.value,
        },
      });
    }
  };

  getRemoveIcon = () => {
    const { variable, namespace, cx, labeledStyles, rjvId } = this.props;

    return (
      <div className='click-to-remove' style={{ verticalAlign: 'top' }}>
        <Remove
          className={cx('click-to-remove-icon', labeledStyles.editVarIcon)}
          onClick={() => {
            dispatcher.dispatch({
              name: 'VARIABLE_REMOVED',
              rjvId: rjvId,
              data: {
                name: variable.name,
                namespace: namespace,
                existing_value: variable.value,
                variable_removed: true,
              },
            });
          }}
        />
      </div>
    );
  };

  getValue = (variable, editMode) => {
    const type = editMode ? false : variable.type;
    const { props } = this;
    switch (type) {
      case false:
        return this.getEditInput();
      case 'string':
        return <JsonString value={variable.value} {...props} />;
      case 'integer':
        return <JsonInteger value={variable.value} {...props} />;
      case 'float':
        return <JsonFloat value={variable.value} {...props} />;
      case 'boolean':
        return <JsonBoolean value={variable.value} {...props} />;
      case 'function':
        return <JsonFunction value={variable.value} {...props} />;
      case 'null':
        return <JsonNull {...props} />;
      case 'nan':
        return <JsonNan {...props} />;
      case 'undefined':
        return <JsonUndefined {...props} />;
      case 'date':
        return <JsonDate value={variable.value} {...props} />;
      case 'regexp':
        return <JsonRegexp value={variable.value} {...props} />;
      default:
        // catch-all for types that weren't anticipated
        return <div className='object-value'>{JSON.stringify(variable.value)}</div>;
    }
  };

  getEditInput = () => {
    const { labeledStyles, cx } = this.props;
    const { editValue } = this.state;

    return (
      <div>
        <AutosizeTextarea
          type='text'
          inputRef={(input) => input && input.focus()}
          value={editValue}
          className={cx('variable-editor', labeledStyles.editInput)}
          placeholder='update this value'
          onChange={(event) => {
            const value = event.target.value;
            const detected = parseInput(value);
            this.setState({
              editValue: value,
              parsedInput: {
                type: detected.type,
                value: detected.value,
              },
            });
          }}
          onKeyDown={(e) => {
            // eslint-disable-next-line default-case
            switch (e.key) {
              case 'Escape': {
                this.setState({
                  editMode: false,
                  editValue: '',
                });
                break;
              }
              case 'Enter': {
                if (e.ctrlKey || e.metaKey) {
                  this.submitEdit(true);
                }
                break;
              }
            }
            e.stopPropagation();
          }}
        />
        <div className={cx(labeledStyles.editIconContainer)}>
          <Remove
            className={cx('edit-cancel', labeledStyles.cancelIcon)}
            onClick={() => {
              this.setState({ editMode: false, editValue: '' });
            }}
          />
          <CheckCircle
            className={cx('edit-check', 'string-value', labeledStyles.checkIcon)}
            onClick={() => {
              this.submitEdit();
            }}
          />
          <div>{this.showDetected()}</div>
        </div>
      </div>
    );
  };

  submitEdit = (submit_detected) => {
    const { variable, namespace, rjvId } = this.props;
    const { editValue, parsedInput } = this.state;
    let new_value = editValue;
    if (submit_detected && parsedInput.type) {
      new_value = parsedInput.value;
    }
    this.setState({
      editMode: false,
    });
    dispatcher.dispatch({
      name: 'VARIABLE_UPDATED',
      rjvId: rjvId,
      data: {
        name: variable.name,
        namespace: namespace,
        existing_value: variable.value,
        new_value: new_value,
        variable_removed: false,
      },
    });
  };

  showDetected = () => {
    const { variable, namespace, rjvId, cx, labeledStyles } = this.props;
    const { type, value } = this.state.parsedInput;
    const detected = this.getDetectedInput();
    if (detected) {
      return (
        <div>
          <div className={cx(labeledStyles.detectedRow)}>
            {detected}
            <CheckCircle
              className={cx('edit-check', 'detected', labeledStyles.checkIcon)}
              style={{
                verticalAlign: 'top',
                paddingLeft: '3px',
              }}
              onClick={() => {
                this.submitEdit(true);
              }}
            />
          </div>
        </div>
      );
    }
  };

  getDetectedInput = () => {
    const { parsedInput } = this.state;
    const { type, value } = parsedInput;
    const { props } = this;
    const { cx, labeledStyles } = props;

    if (type !== false) {
      // eslint-disable-next-line default-case
      switch (type.toLowerCase()) {
        case 'object':
          return (
            <span>
              <span
                className={cx(labeledStyles.brace)}
                style={{
                  cursor: 'default',
                }}
              >
                {'{'}
              </span>
              <span
                className={cx(labeledStyles.ellipsis)}
                style={{
                  cursor: 'default',
                }}
              >
                ...
              </span>
              <span
                className={cx(labeledStyles.brace)}
                style={{
                  cursor: 'default',
                }}
              >
                {'}'}
              </span>
            </span>
          );
        case 'array':
          return (
            <span>
              <span
                className={cx(labeledStyles.brace)}
                style={{
                  cursor: 'default',
                }}
              >
                {'['}
              </span>
              <span
                className={cx(labeledStyles.ellipsis)}
                style={{
                  cursor: 'default',
                }}
              >
                ...
              </span>
              <span
                className={cx(labeledStyles.brace)}
                style={{
                  cursor: 'default',
                }}
              >
                {']'}
              </span>
            </span>
          );
        case 'string':
          return <JsonString value={value} {...props} />;
        case 'integer':
          return <JsonInteger value={value} {...props} />;
        case 'float':
          return <JsonFloat value={value} {...props} />;
        case 'boolean':
          return <JsonBoolean value={value} {...props} />;
        case 'function':
          return <JsonFunction value={value} {...props} />;
        case 'null':
          return <JsonNull {...props} />;
        case 'nan':
          return <JsonNan {...props} />;
        case 'undefined':
          return <JsonUndefined {...props} />;
        case 'date':
          return <JsonDate value={new Date(value)} {...props} />;
      }
    }
  };
}

//export component
export default VariableEditor;
