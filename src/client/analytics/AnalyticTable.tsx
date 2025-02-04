import React, { useCallback, useContext, useMemo } from 'react';

import { cardCanBeSorted, sortGroupsOrdered, SORTS } from 'utils/Sort';
import { fromEntries } from 'utils/Util';

import Card from '../../datatypes/Card';
import AsfanDropdown from '../components/analytics/AsfanDropdown';
import { Col, Flexbox, Row } from '../components/base/Layout';
import Select from '../components/base/Select';
import Text from '../components/base/Text';
import ErrorBoundary from '../components/ErrorBoundary';
import { compareStrings, SortableTable, valueRenderer } from '../components/SortableTable';
import CubeContext from '../contexts/CubeContext';
import { calculateAsfans } from '../drafting/createdraft';
import useQueryParam from '../hooks/useQueryParam';

type SortWithTotalResult = [string, number][];

const sortWithTotal: (pool: Card[], sort: string) => SortWithTotalResult = (pool: Card[], sort: string) =>
  [...sortGroupsOrdered(pool, sort, true), ['Total', pool]].map(([label, cards]) => [
    label as string,
    (cards as Card[]).reduce((acc, card) => acc + card.asfan!, 0),
  ]);

const AnalyticTable: React.FC = ({}) => {
  const { cube, changedCards } = useContext(CubeContext);
  const cards = changedCards.mainboard;
  const [column, setColumn] = useQueryParam('column', 'Color Identity');
  const [row, setRow] = useQueryParam('row', 'Type');
  const [percentOf, setPercentOf] = useQueryParam('percentOf', 'total');
  const [useAsfans, setUseAsfans] = useQueryParam('asfans', 'false');
  const [draftFormat, setDraftFormat] = useQueryParam('format', '-1');

  const asfans = useMemo(() => {
    if (useAsfans !== 'true') {
      return {};
    }
    try {
      return calculateAsfans(cube, cards, parseInt(draftFormat, 10));
    } catch (e) {
      console.error('Invalid Draft Format', draftFormat, cube.formats[parseInt(draftFormat)], e);
      return {};
    }
  }, [cards, cube, draftFormat, useAsfans]);

  // some criteria cannot be applied to some cards
  const cardsWithAsfan = useMemo(
    () =>
      cards
        .filter((card) => cardCanBeSorted(card, column) && cardCanBeSorted(card, row))
        .map((card) => ({ ...card, asfan: asfans[card.cardID] || 1 })),
    [asfans, cards, column, row],
  );

  const [columnCounts, columnLabels] = useMemo(() => {
    const counts = sortWithTotal(cardsWithAsfan, column).filter(([label, count]) => label === 'Total' || count > 0);
    return [fromEntries(counts), counts.map(([label]) => label)];
  }, [cardsWithAsfan, column]);

  const rows = useMemo(
    () =>
      [...sortGroupsOrdered(cardsWithAsfan, row, true), ['Total', cardsWithAsfan]]
        .map(([label, groupCards]) => [label, fromEntries(sortWithTotal(groupCards as Card[], column))])
        .map(([rowLabel, columnValues]) => ({
          rowLabel,
          ...fromEntries(columnLabels.map((label) => [label, (columnValues as Record<string, number>)[label] ?? 0])),
        })),
    [cardsWithAsfan, column, row, columnLabels],
  );

  const entryRenderer = useCallback(
    (value: number, { Total: rowTotal }: { Total: number }, columnLabel: string) => {
      value = Number.isFinite(value) ? value : 0;
      let scalingFactor: number | null = null;
      if (percentOf === 'total') scalingFactor = 100 / columnCounts.Total;
      else if (percentOf === 'row') scalingFactor = 100 / rowTotal;
      else if (percentOf === 'column') scalingFactor = 100 / columnCounts[columnLabel];
      return (
        <Text>
          {valueRenderer(value)}
          {scalingFactor && (
            <Text sm className="text-text-secondary ml-1">
              {`(${valueRenderer(value * scalingFactor)}%)`}
            </Text>
          )}
        </Text>
      );
    },
    [columnCounts, percentOf],
  );

  const columnProps = useMemo(
    () => [
      { key: 'rowLabel', title: row, heading: true, sortable: true },
      ...columnLabels.map((title) => ({ key: title, title, heading: false, sortable: true, renderFn: entryRenderer })),
    ],
    [entryRenderer, columnLabels, row],
  );

  return (
    <Flexbox direction="col" gap="2" className="m-2">
      <Text>View card counts and percentages.</Text>
      <Row>
        <Col xs={12} md={4}>
          <Select
            label="Columns"
            options={SORTS.map((item) => ({ value: item, label: item }))}
            value={column}
            setValue={setColumn}
          />
        </Col>
        <Col xs={12} md={4}>
          <Select
            label="Rows"
            options={SORTS.map((item) => ({ value: item, label: item }))}
            value={row}
            setValue={setRow}
          />
        </Col>
        <Col xs={12} md={4}>
          <Select
            label="Show Percent Of"
            options={['total', 'row', 'column', 'none'].map((item) => ({ value: item, label: item }))}
            value={percentOf}
            setValue={setPercentOf}
          />
        </Col>
      </Row>
      <AsfanDropdown
        cube={cube}
        draftFormat={draftFormat}
        setDraftFormat={setDraftFormat}
        useAsfans={useAsfans === 'true'}
        setUseAsfans={(val) => setUseAsfans(val.toString())}
      />
      <ErrorBoundary>
        <SortableTable columnProps={columnProps} data={rows} sortFns={{ rowLabel: compareStrings }} />
      </ErrorBoundary>
    </Flexbox>
  );
};
export default AnalyticTable;
