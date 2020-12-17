import {
  Box,
  Theme,
  MenuList,
  MenuItem,
  Paper,
  makeStyles,
  createStyles,
} from '@material-ui/core';
import React from 'react';
import { ErrorMessage } from 'formik';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

import Input, { InputProps } from './Input/Input';


const useStyles = makeStyles((theme: Theme) => createStyles({
  selectBox: {
    maxHeight: 200,
    overflow: 'scroll',
    position: 'absolute',
    zIndex: 1,
  },
  selectItem: {
    whiteSpace: 'unset',
  },
  errorMessage: {
    color: theme.palette.other.red.main,
    fontWeight: 'normal',
    fontSize: 10,
    letterSpacing: 0.3,
    textAlign: 'left',
    position: 'absolute',
    bottom: '-20px',
    width: 'max-content',
  },
}));

interface AutocompletionRequest {
  types?: [string];
}

interface GooglePlacesAutocompleteProps {
  initialValue?: string;
  error?: boolean;
  name: string;
  touched?: boolean;
  onSelect?: (selection) => void;
  placeholder?: string;
  autocompletionRequest?: AutocompletionRequest;
}

export interface GoogleAutocompleteProps extends GooglePlacesAutocompleteProps {
  inputProps: InputProps;
}

const GoogleAutocomplete: React.FunctionComponent<GoogleAutocompleteProps> = ({
  inputProps,
  error,
  touched,
  name,
  ...restProps
}) => {
  const classes = useStyles();

  return (
    <Box position="relative">
      <GooglePlacesAutocomplete
        loader={<div />}
        renderInput={(params): JSX.Element => (
          <Input
            error={error}
            touched={touched}
            {...inputProps}
            formControlStyle="none"
            inputProps={{
              ...params,
            }}
          />
        )}
        renderSuggestions={(active, suggestions, onSelectSuggestion): JSX.Element => (
          <Paper className={classes.selectBox}>
            <MenuList>
              {suggestions.map((suggestion, key) => (
                <MenuItem
                  key={key}
                  className={classes.selectItem}
                  onClick={(event): void => onSelectSuggestion(suggestion, event)}
                >
                  {suggestion.description}
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        )}
        {...restProps}
      />
      {name && (
        <ErrorMessage
          component="span"
          className={classes.errorMessage}
          name={name}
        />
      )}
    </Box>
  );
};

export default GoogleAutocomplete;
