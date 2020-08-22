import React, { useState, useCallback } from 'react';
import './App.css';
import { TextField } from '@material-ui/core';
import jp from 'jsonpath';
import { get } from 'lodash';
//import { recursiveMerge } from './Store';
import { observer } from 'mobx-react';
import ReactJsonView from './viewer/js/ReactJsonView';

const App = observer(({ store }) => {
  //recursiveMerge(inp, { XA: false, XX: false });
  //console.log('inp', inp);

  const [formula, setFormula] = useState('');

  const onFormulaChange = useCallback((e) => {
    setFormula(e.target.value);
  }, []);

  const tree = store.tree;
  let paths = [];
  let acc = [];
  let values = [];

  if (formula && formula !== '') {
    try {
      paths = jp.paths(tree, formula);
      values = paths.map((path, i) => {
        let x = jp.stringify(path);
        if (x.startsWith('$')) {
          x = x.slice(1);
        }
        acc.push(x);
        let v = get(tree, x);
        return typeof v !== 'string' ? JSON.stringify(v) : v;
      });
      console.log('paths', paths);
      console.log('accs', acc);
      console.log('values', values);
    } catch (e) {
      console.warn(e);
    }
  }

  return (
    <div className='App'>
      <header className='App-header'>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <TextField
          className='txt'
          onChange={onFormulaChange}
          variant='outlined'
          label='JSONPath formula'
        ></TextField>
      </header>
      <ReactJsonView
        store={store}
        src={store.tree}
        iconStyle='square'
        displayDataTypes={false}
        enableClipboard={false}
      />
      <table>
        {paths.map((val, index) => (
          <tr key={index}>
            <td>{jp.stringify(val)}</td>
            <td>{acc[index]}</td>
            <td>{values[index]}</td>
          </tr>
        ))}
      </table>
    </div>
  );
});

export default App;
