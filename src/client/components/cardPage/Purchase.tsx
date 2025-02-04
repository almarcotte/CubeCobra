import React from 'react';

import { getCardHoarderLink, getCardKingdomLink, getCardMarketLink, getTCGLink } from 'utils/Affiliate';
import { detailsToCard } from 'utils/cardutil';

import { CardDetails } from '../../../datatypes/Card';
import Button from '../base/Button';
import { Card, CardBody, CardHeader } from '../base/Card';
import { Flexbox } from '../base/Layout';
import Text from '../base/Text';

interface PurchaseProps {
  card: CardDetails;
}

const Purchase: React.FC<PurchaseProps> = ({ card }) => {
  return (
    <Card>
      <CardHeader>
        <Text semibold lg>
          Purchase
        </Text>
      </CardHeader>
      <CardBody>
        <Flexbox direction="col" gap="2">
          <Button type="link" outline color="accent" block href={getTCGLink(detailsToCard(card))} target="_blank">
            <Flexbox direction="row" justify="between" className="w-full">
              <Text semibold>TCGPlayer</Text>
              {card.prices.usd && <Text semibold>{`$${card.prices.usd.toFixed(2)}`}</Text>}
            </Flexbox>
          </Button>
          <Button
            type="link"
            outline
            color="accent"
            block
            href={getCardKingdomLink(detailsToCard(card))}
            target="_blank"
          >
            <Flexbox direction="row" justify="between" className="w-full">
              <Text semibold>Card Kingdom</Text>
            </Flexbox>
          </Button>
          <Button
            type="link"
            outline
            color="accent"
            block
            href={getCardMarketLink(detailsToCard(card))}
            target="_blank"
          >
            <Flexbox direction="row" justify="between" className="w-full">
              <Text semibold>CardMarket</Text>
              {card.prices.eur && <Text semibold>{`€${card.prices.eur.toFixed(2)}`}</Text>}
            </Flexbox>
          </Button>
          <Button
            type="link"
            outline
            color="accent"
            block
            href={getCardHoarderLink(detailsToCard(card))}
            target="_blank"
          >
            <Flexbox direction="row" justify="between" className="w-full">
              <Text semibold>CardHoarder</Text>
              {card.prices.tix && <Text semibold>{`${card.prices.tix.toFixed(2)} TIX`}</Text>}{' '}
            </Flexbox>
          </Button>
        </Flexbox>
      </CardBody>
    </Card>
  );
};

export default Purchase;
