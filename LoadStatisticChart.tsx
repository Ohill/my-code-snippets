import React, { useMemo } from 'react';
import {
  Box,
  BoxProps,
  useTheme,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DateTime } from 'luxon';
import { formatDate } from '../core/utils/timeHelper';

import { LoadStatus } from '../load/types';
import { LoadStatusesStatistic } from './types';

export type ChartData = LoadStatusesStatistic;

export interface LoadStatisticChartProps extends BoxProps {
  data: ChartData[];
}

export interface ChartLine {
  status: string;
  color: string;
}

export const useChartLines = (): ChartLine[] => {
  const theme = useTheme();
  return useMemo(() => (
    [
      {
        status: LoadStatus.AVAILABLE,
        color: theme.palette.other.green.main,
      },
      {
        status: LoadStatus.DISPATCHED,
        color: theme.palette.other.yellow.main,
      },
      {
        status: LoadStatus.DELIVERED,
        color: theme.palette.other.red.main,
      },
      {
        status: LoadStatus.BILLED,
        color: theme.palette.other.blue.darker!,
      },
    ]
  ), [theme]);
};

const LoadStatisticChart: React.FunctionComponent<LoadStatisticChartProps> = ({
  data,
  ...restProps
}) => {
  const { t } = useTranslation('dashboard');
  const theme = useTheme();
  const chartLines = useChartLines();
  return (
    <Box {...restProps}>
      <ResponsiveContainer width="95%" height={450}>
        <LineChart
          data={data}
        >
          <XAxis
            interval={0}
            dataKey="date"
            tickFormatter={(date): string => (
              DateTime.fromISO(date).get('day').toString()
            )}
            stroke={theme.palette.grayscale[8]}
          />
          <YAxis
            interval={0}
            stroke={theme.palette.grayscale[7]}
          />
          <Tooltip
            labelFormatter={
              (label): string => (
                formatDate(String(label))
              )
            }
          />
          {chartLines.map(({ status, color }) => (
            <Line
              key={status}
              dot={false}
              type="monotone"
              name={t<string>(status)}
              dataKey={(dayData: LoadStatusesStatistic): number => {
                const record = dayData.statusesStatistic.find(({ status: itemStatus }) => (
                  status === itemStatus
                ));
                if (!record) {
                  return 0;
                }
                return record.count;
              }}
              stroke={color}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LoadStatisticChart;
