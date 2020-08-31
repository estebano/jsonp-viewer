import React, { useState, useCallback } from 'react';
import './App.css';
import { TextField, Grid, Button } from '@material-ui/core';

//import { recursiveMerge } from './Store';
import { observer } from 'mobx-react';
import ReactJsonView from './viewer/js/ReactJsonView';
import { useSnackbar } from 'notistack';
import MobXStore from './viewer/js/stores/MobXStore';
import { debounce } from 'lodash';

const readFileAsync = async (file) => {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject(new Error('file is not a File instance'));
    }

    let reader = new FileReader();
    reader.onload = (e) => {
      return resolve(e.target.result);
    };
    reader.readAsText(file);
  });
};

const App = observer(() => {
  const [formula, setFormula] = useState('');
  const [store, setStore] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const onFormulaChangeDebounced = useCallback(
    (e) => {
      setFormula(e.target.value);
      store && store.setJsonPath(e.target.value);
    },
    [store]
  );

  const onFileChange = useCallback(
    async (e) => {
      const target = e.target;
      if (target.files.length === 0) {
        enqueueSnackbar('No file choosen to load', { variant: 'warning' });
        return;
      }
      try {
        let content = await readFileAsync(target.files[0]);
        let json = JSON.parse(content);
        let store = new MobXStore(json);
        setStore(store);
      } catch (ex) {
        enqueueSnackbar('Invalid file selected or bad json format.', { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

  return (
    <div className='App'>
      <header className='App-header'>
        <Grid container alignItems='flex-start' spacing={2}>
          <Grid item xs={6}>
            <TextField
              onChange={onFormulaChangeDebounced}
              variant='outlined'
              label='JSONPath formula'
              className='fullwidth'
            ></TextField>
          </Grid>
          <Grid item xs={6}>
            <React.Fragment>
              <input
                id='upload'
                type='file'
                accept='.json'
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
              <label htmlFor='upload'>
                <Button variant='contained' color='primary' component='span'>
                  Load file
                </Button>
              </label>
            </React.Fragment>
          </Grid>
        </Grid>
      </header>
      {store && (
        <ReactJsonView
          store={store}
          src={store.tree}
          iconStyle='square'
          displayDataTypes={false}
          enableClipboard={false}
        />
      )}
    </div>
  );
});

export default App;
