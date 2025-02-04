import React, { useContext, useMemo } from 'react';

import { getTCGLink } from 'utils/Affiliate';

import CardType from '../../datatypes/Card';
import { Card, CardBody } from '../components/base/Card';
import { Flexbox } from '../components/base/Layout';
import { Col,Row } from '../components/base/Layout';
import Link from '../components/base/Link';
import Text from '../components/base/Text';
import Markdown from '../components/Markdown';
import MassBuyButton from '../components/MassBuyButton';
import CubeContext from '../contexts/CubeContext';

const compareCards = (x: CardType, y: CardType) => x.details?.name.localeCompare(y.details?.name || '') || 0;
const sortCards = (cards: CardType[]) => [...cards].sort(compareCards);

const dedupeCards = (cards: CardType[]) => {
  const map = new Map<string, CardType>();
  for (const card of [...cards].reverse()) {
    map.set(card.details?.name || '', card);
  }
  return [...map.values()];
};

interface TokensProps {
  tokenMap: { [key: string]: CardType };
}

interface PositionedCard extends CardType {
  position: number;
}

const Tokens: React.FC<TokensProps> = ({ tokenMap }) => {
  const { cube, changedCards } = useContext(CubeContext);
  const cards = changedCards.mainboard;
  const data = useMemo(() => {
    const positioned = cards.map((card, index) => ({ ...card, position: index }));
    const byOracleId: { [key: string]: { token: CardType; cards: PositionedCard[] } } = {};
    for (const card of positioned) {
      for (const token of card.details?.tokens || []) {
        //Equivalent tokens from different sets have their own unique id, but share an oracle id.
        //Eg 2 1/1 white bird tokens from different sets have card Ids A and B, but share oracle id C
        const oracleId = tokenMap[token].details?.oracle_id;
        if (oracleId == undefined) {
          continue;
        }

        if (!byOracleId[oracleId]) {
          byOracleId[oracleId] = {
            token: tokenMap[token],
            cards: [],
          };
        }
        byOracleId[oracleId].cards.push({
          ...card,
          position: card.position,
        });
      }
    }

    const sorted = [...Object.entries(byOracleId)];
    sorted.sort((x, y) => compareCards(x[1].token, y[1].token));
    return sorted.map(([, tokenData]) => ({
      card: tokenData.token,
      cardDescription: sortCards(dedupeCards(tokenData.cards))
        .map((c) => {
          const position = (c as PositionedCard).position;
          const details = cards[position].details;
          return details ? `[[${details.name}|${details.scryfall_id}]]` : '';
        })
        .join('\n\n'),
    }));
  }, [cards]);

  return (
    <Flexbox direction="col" gap="2" className="m-2">
      <Text semibold lg>
        Tokens
      </Text>
      <Text>All the tokens and emblems your cube uses and what cards require each of them.</Text>
      <MassBuyButton color="primary" cards={data.map(({ card }) => card)}>
        Buy All Tokens
      </MassBuyButton>
      <Row>
        {data.map(({ card, cardDescription }, index) => (
          <Col key={index} xs={6} md={4} lg={3} xxl={2}>
            <Card className="mb-3">
              <Link href={getTCGLink(card)}>
                <img src={card.details?.image_normal} className="card-img-top" alt={card.details?.name} />
              </Link>
              <CardBody>
                <Markdown markdown={cardDescription} cube={cube} />
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Flexbox>
  );
};

export default Tokens;
