import React, { FC, ChangeEvent, ReactNode } from 'react';
import { Select, MenuItem, FormControl, makeStyles, InputLabel } from '@material-ui/core';

interface CriteraProps {
  critera: string;
  handleCriteraChange: (
    event: ChangeEvent<{ name?: string | undefined; value: unknown }>,
    child: ReactNode
  ) => void;
}

const OtherCriteria: FC<CriteraProps> = ({ critera, handleCriteraChange }) => {
  const useStyles = makeStyles(theme => ({
    formControl: {
      margin: theme.spacing(1, 0),
      minWidth: 120
    }
  }));

  const classes = useStyles();

  return (
    <FormControl variant="outlined" className={classes.formControl} fullWidth>
      <InputLabel>Criteria</InputLabel>
      <Select
        value={critera}
        onChange={handleCriteraChange}
        displayEmpty
        label="Criteria"
        error={critera === ''}
      >
        <MenuItem value={'other'}>Other Library</MenuItem>
      </Select>
    </FormControl>
  );
};

export default OtherCriteria;
