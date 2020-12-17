import {
  Avatar,
  Box,
  Grid,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Button,
  BoxProps,
} from '@material-ui/core';
import cx from 'classnames';
import { Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import LocalShippingOutlinedIcon from '@material-ui/icons/LocalShippingOutlined';
import {
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd';
import { get } from 'lodash';
import Link from 'next/link';
import { TFunction } from 'i18next';

import ActionButton from '../core/components/ActionButton';
import DriverWithAssetsResultContainer from './cards/DriverWithAssetsResultContainer';
import LoadPhotoPlaceholder from '../core/components/LoadPhotoPlaceholder';
import trailerIcon from '../../assets/images/trailer.svg';
import { LoadExtended } from '../load/types';
import { LoadCard } from './cards/LoadCards';
import { DraggableCard } from './types';
import { Driver } from '../driver/types';
import { Asset } from '../asset/types';
import useCommonStyles from '../core/styles';
import useStyles from './style';


const useOwnStyles = makeStyles((theme: Theme) => createStyles({
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 0.3,
    color: theme.palette.grayscale[10],
  },
  resetBtn: {
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: 0.2,
    textTransform: 'none',
    marginRight: theme.spacing(2),
  },
  dispatch: {
    textTransform: 'none',
    width: 150,
  },
  droppableBox: {
    padding: theme.spacing(5),
    paddingTop: theme.spacing(7),
    border: `1px dashed ${theme.palette.primary.main}`,
    borderRadius: 8,
    textAlign: 'center',
  },
  driverWithAssetsBox: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    padding: theme.spacing(0, 5),
  },
  driverWithAssetsPlaceholder: {
    padding: theme.spacing(0, 5),
    position: 'absolute',
    zIndex: 0,
  },
  loadsDroppableArea: {
    padding: theme.spacing(0, 6),
  },
  highlightArea: {
    background: theme.palette.other.blue.bright,
  },
  mr2: {
    marginRight: theme.spacing(2),
  },
  warning: {
    color: theme.palette.other.yellow.main,
    margin: theme.spacing(2, 8),
  },
}));


export interface TripConstructorProps extends BoxProps {
  split: boolean;
  tripId?: number;
  truckId: number;
  loading: boolean;
  driverId: number;
  splitInfo: {
    driverSplit: boolean;
    truckSplit: boolean;
    trailerSplit: boolean;
  };
  trailerId: number;
  tripLoads: number;
  editMode?: boolean;
  lengthWarning?: boolean;
  weightWarning?: boolean;
  airRideWarning?: boolean;
  tripExternalNumber?: number;
  currentDraggingCard: DraggableCard;
  measurementSystemT: TFunction;
  setSplit: React.Dispatch<React.SetStateAction<boolean>>;
}

const TripConstructor: React.FunctionComponent<TripConstructorProps> = ({
  split,
  tripId,
  editMode,
  truckId,
  loading,
  setSplit,
  driverId,
  trailerId,
  tripLoads,
  lengthWarning,
  weightWarning,
  splitInfo,
  airRideWarning,
  tripExternalNumber,
  measurementSystemT,
  currentDraggingCard,
  ...restProps
}) => {
  const classes = useStyles();
  const ownStyles = useOwnStyles();
  const commonClasses = useCommonStyles();
  const { setFieldValue } = useFormikContext();
  const { t } = useTranslation(['btn', 'trips']);

  return (
    <Droppable droppableId="trip">
      {(provided: DroppableProvided): JSX.Element => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <Box
            display="flex"
            flexDirection="column"
            className={classes.resultTripContentInner}
            {...restProps}
          >
            <Box
              pt={8}
              px={8}
              display="flex"
              justifyContent="space-between"
            >
              <Typography className={ownStyles.title}>
                {editMode ? t('trips:editTrip', { tripId: tripExternalNumber }) : t('trips:newTrip')}
              </Typography>
              <Box>
                {editMode ? (
                  <Link href={`/trips/${tripId}`} passHref>
                    <Button
                      color="primary"
                      className={cx(
                        commonClasses.deleteBtn,
                        ownStyles.mr2,
                      )}
                    >
                      {t('btn:cancel')}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    color="primary"
                    className={ownStyles.resetBtn}
                    onClick={(): void => {
                      setFieldValue('loads', []);
                      setFieldValue('driverWithAssets', {});
                    }}
                  >
                    {t('btn:reset')}
                  </Button>
                )}
                <ActionButton
                  type="submit"
                  color="primary"
                  loading={loading}
                  variant="contained"
                  className={ownStyles.dispatch}
                  disabled={!(truckId && driverId && trailerId && tripLoads)}
                >
                  {editMode ? t('btn:save') : t('btn:dispatch')}
                </ActionButton>
              </Box>
            </Box>
            {lengthWarning && <Typography className={ownStyles.warning}>
              {t('trips:lengthWarning')}
            </Typography>}
            {weightWarning && <Typography className={ownStyles.warning}>
              {t('trips:weightWarning')}
            </Typography>}
            {airRideWarning && <Typography className={ownStyles.warning}>
              {t('trips:airRideWarning')}
            </Typography>}
            <Box
              pt={(lengthWarning || weightWarning || airRideWarning) ? 7 : 13 }
              position="relative"
              minHeight={200}
              height={200}
            >
              <Field name="driverWithAssets">
                {({
                  field: {
                    name,
                    value: {
                      driver,
                      truck,
                      trailer,
                    },
                  },
                }: FieldProps): React.ReactNode => (
                  <>
                    {(driver || truck || trailer) && (
                      <Box className={ownStyles.driverWithAssetsBox}>
                        <Box
                          width="100%"
                          mb={8}
                          minHeight={123}
                          display="flex"
                          justifyContent={driver
                            ? 'flex-start' : (!driver && !trailer)
                              ? 'center' : 'flex-end'
                          }
                        >
                          <DriverWithAssetsResultContainer
                            driver={driver}
                            trailer={trailer}
                            truck={truck}
                            splitInfo={splitInfo}
                            currentDraggingCard={currentDraggingCard}
                            onClose={(value: { driver?: Driver; truck?: Asset; trailer?: Asset }): void => setFieldValue(name, value)}
                          />
                        </Box>
                      </Box>
                    )}
                    <Grid
                      container
                      justify="space-between"
                      className={ownStyles.driverWithAssetsPlaceholder}>
                      <Grid item>
                        <Box className={cx(
                          {
                            [ownStyles.highlightArea]: get(currentDraggingCard, 'driver'),
                          },
                          ownStyles.droppableBox,
                        )}>
                          <Avatar
                            className={classes.assetDriverCardPhotos}
                            classes={{
                              root: classes.blueBackground,
                              fallback: classes.driverIcon,
                            }}
                          />
                          <Typography className={classes.creationText}>
                            {t('trips:addDriver')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item>
                        <Box className={cx(
                          {
                            [ownStyles.highlightArea]: get(currentDraggingCard, 'truck'),
                          },
                          ownStyles.droppableBox,
                        )}>
                          <Avatar
                            className={cx(
                              classes.assetDriverCardPhotos,
                              classes.blueBackground,
                            )}
                          >
                            <LocalShippingOutlinedIcon
                              className={commonClasses.truckIcon}
                              fontSize="large" />
                          </Avatar>
                          <Typography className={classes.creationText}>
                            {t('trips:addTruck')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item>
                        <Box className={cx(
                          {
                            [ownStyles.highlightArea]: get(currentDraggingCard, 'trailer'),
                          },
                          ownStyles.droppableBox,
                        )}>
                          <Avatar
                            className={cx(
                              classes.assetDriverCardPhotos,
                              classes.blueBackground,
                            )}
                          >
                            <img src={trailerIcon} className={commonClasses.trailerIcon} />
                          </Avatar>
                          <Typography className={classes.creationText}>
                            {t('trips:addTrailer')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                )}
              </Field>
            </Box>
            {editMode && <Box
              zIndex={3}
              textAlign="right"
            >
              <Button
                color="primary"
                disabled={split}
                className={ownStyles.resetBtn}
                onClick={(): void => setSplit(true)}
              >
                {t('btn:split')}
              </Button>
            </Box>}
            <Box mt={editMode ? 3 : 14} overflow="scroll" height="100%">
              <Field name="loads">
                {({
                  field: {
                    value,
                    name,
                  },
                }: FieldProps): React.ReactNode => (
                  <Box className={ownStyles.loadsDroppableArea}>
                    <Box
                      mb={8}
                      height={value.length ? 120 : 350}
                      display="flex"
                      alignItems="center"
                      flexDirection="column"
                      justifyContent="center"
                      className={cx(
                        { [ownStyles.highlightArea]: get(currentDraggingCard, 'load') },
                        ownStyles.droppableBox,
                      )}
                    >
                      <Avatar style={{ margin: 0 }} className={cx(classes.loadCardPhoto, classes.loadPlaceholder)}>
                        <LoadPhotoPlaceholder />
                      </Avatar>
                      <Typography className={classes.creationText}>
                        {t('trips:addLoads')}
                      </Typography>
                    </Box>
                    {!!value.length && value.map((load: LoadExtended, key: number) => (
                      <LoadCard
                        editMode
                        measurementSystemT={measurementSystemT}
                        onClose={(): void => {
                          const newValue = value;
                          newValue.splice(key, 1);
                          setFieldValue(name, [...newValue]);
                        }}
                        key={key}
                        load={load}
                        mb={8}
                        className={classes.contentInner}
                      />
                    ))}
                  </Box>
                )}
              </Field>
            </Box>
          </Box>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default TripConstructor;
