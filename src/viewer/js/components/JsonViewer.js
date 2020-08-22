import React from 'react';
import JsonObject from './DataTypes/JsonObject';
import ArrayGroup from './ArrayGroup';
import { observer } from 'mobx-react';

class JsonViewer extends React.PureComponent {
  render = () => {
    const { props } = this;

    console.log('Inside JsonViewer props', props);

    const namespace = [props.name];
    let ObjectComponent = JsonObject;

    if (props.groupArraysAfterLength && props.src.length > props.groupArraysAfterLength) {
      ObjectComponent = ArrayGroup;
    }

    return (
      <div class='pretty-json-container object-container'>
        <div class='object-content'>
          <ObjectComponent namespace={namespace} depth={0} jsvRoot={true} {...props} />
        </div>
      </div>
    );
  };
}

export default observer((props) => <JsonViewer {...props} />);
