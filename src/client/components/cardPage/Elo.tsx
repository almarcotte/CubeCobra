import React from 'react';

import { CardBody } from 'components/base/Card';
import EloGraph from 'components/EloGraph';
import { CardDetails } from 'datatypes/Card';
import HistoryType from 'datatypes/History';

interface CardPageProps {
  card: CardDetails;
  history: HistoryType[];
}

const CardBreakdownInfo: React.FC<CardPageProps> = ({ card, history }) => {
  return (
    <CardBody>
      <EloGraph defaultHistories={history} cardId={card.oracle_id} />
    </CardBody>
  );
};

export default CardBreakdownInfo;
