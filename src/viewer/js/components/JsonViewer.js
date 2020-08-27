import React from 'react';
import JsonObject from './DataTypes/JsonObject';
import ArrayGroup from './ArrayGroup';
import { observer } from 'mobx-react';

class JsonViewer extends React.PureComponent {
  render = () => {
    const { props } = this;

    const namespace = [props.name];
    let ObjectComponent = JsonObject;

    if (props.groupArraysAfterLength && props.src.value.length > props.groupArraysAfterLength) {
      ObjectComponent = ArrayGroup;
    }

    return (
      <div className='pretty-json-container object-container'>
        <div className='object-content'>
          <ObjectComponent namespace={namespace} depth={0} jsvRoot={true} {...props} />
        </div>
      </div>
    );
  };
}

export default observer((props) => <JsonViewer {...props} />);
