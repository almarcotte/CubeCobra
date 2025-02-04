import { NextFunction, Request, Response } from 'express-serve-static-core';
import Joi from 'joi';

import { cardCmc, cardType, detailsToCard } from '../../../../client/utils/cardutil';
import { CardDetails } from '../../../../datatypes/Card';
import type CubeType from '../../../../datatypes/Cube';
import DraftType, { DraftmancerLog, DraftmancerPick } from '../../../../datatypes/Draft';
import type DraftSeatType from '../../../../datatypes/DraftSeat';
import Cube from '../../../../dynamo/models/cube';
import Draft from '../../../../dynamo/models/draft';
import { cardFromId, getReasonableCardByOracle } from '../../../../util/carddb';
import { deckbuild } from '../../../../util/draftbots';
import { setupPicks } from '../../../../util/draftutil';

interface Pick {
  booster: string[]; // oracle id
  picks: number[]; // Indices into booster
  burn: number[];
}

interface Decklist {
  main: string[]; // oracle id
  side: string[]; // oracle id
  lands: {
    W: number;
    U: number;
    B: number;
    R: number;
    G: number;
  };
}

interface Player {
  userName: string;
  isBot: boolean;
  picks: Pick[];
  decklist: Decklist;
}

export interface PublishDraftBody {
  cubeID: string;
  sessionID: string;
  timestamp: number;
  players: Player[];
  apiKey: string;
}

const OracleIDSchema = Joi.string().uuid();

const PublishDraftBodySchema = Joi.object({
  cubeID: Joi.string().required(),
  sessionID: Joi.string().required(),
  timestamp: Joi.number().required(),
  players: Joi.array()
    .items(
      Joi.object({
        userName: Joi.string().required(),
        isBot: Joi.boolean().required(),
        picks: Joi.array()
          .items(
            Joi.object({
              booster: Joi.array().items(OracleIDSchema).required(),
              picks: Joi.array().items(Joi.number()).required(),
              burn: Joi.array().items(Joi.number()).required(),
            }),
          )
          .required(),
        decklist: Joi.object({
          main: Joi.array().items(OracleIDSchema).required(),
          side: Joi.array().items(OracleIDSchema).required(),
          lands: Joi.object({
            W: Joi.number().required(),
            U: Joi.number().required(),
            B: Joi.number().required(),
            R: Joi.number().required(),
            G: Joi.number().required(),
          }).required(),
        }).required(),
      }),
    )
    .required(),
  apiKey: Joi.string().required(),
});

const validatePublishDraftBody = (req: Request, res: Response, next: NextFunction) => {
  const { error } = PublishDraftBodySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const upsertCardAndGetIndex = (cards: CardDetails[], oracleId: string): number => {
  const card = getReasonableCardByOracle(oracleId);
  const index = cards.findIndex((c) => c.oracle_id === oracleId);

  if (index === -1) {
    cards.push(card);
    return cards.length - 1;
  }

  return index;
};

export const handler = async (req: Request, res: Response) => {
  const publishDraftBody = req.body as PublishDraftBody;

  if (publishDraftBody.apiKey !== process.env.DRAFTMANCER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const cube: CubeType = await Cube.getById(publishDraftBody.cubeID);

    // start with basics, we add the rest of the cards after
    const cards: CardDetails[] = [...cube.basics.map((card) => cardFromId(card))];
    const basics: number[] = [...Array(cube.basics.length).keys()];

    const seats: DraftSeatType[] = [];
    const draftmancerLog: DraftmancerLog = {
      sessionID: publishDraftBody.sessionID,
      players: [],
    };

    for (const player of publishDraftBody.players) {
      const draftmancerPicks: DraftmancerPick[] = [];
      let mainboard: number[][][] = setupPicks(2, 8);
      let sideboard: number[][][] = setupPicks(1, 8);
      const pickorder: number[] = [];
      const trashorder: number[] = [];

      for (const pick of player.picks) {
        // we are going to ignore burned cards
        for (const index of pick.picks) {
          const pack: number[] = pick.booster.map((oracleId) => upsertCardAndGetIndex(cards, oracleId));

          const pickIndex = pack[index];

          pickorder.push(pickIndex);
          draftmancerPicks.push({
            booster: pack,
            pick: pickIndex,
          });
        }
      }

      for (const oracleId of player.decklist.main) {
        const index = upsertCardAndGetIndex(cards, oracleId);
        const card = cards[index];

        const isCreature = card.type.toLowerCase().includes('creature');
        const cmc = card.cmc;

        const row = isCreature ? 0 : 1;
        const col = Math.max(0, Math.min(7, Math.floor(cmc)));

        mainboard[row][col].push(index);
      }

      for (const oracleId of player.decklist.side) {
        const index = upsertCardAndGetIndex(cards, oracleId);
        const card = cards[index];

        const cmc = card.cmc;

        const col = Math.max(0, Math.min(7, Math.floor(cmc)));

        sideboard[0][col].push(index);
      }

      // we need to build the bot decks
      if (player.isBot) {
        const mainboardBuilt = deckbuild(
          pickorder.map((index) => cards[index]),
          basics.map((index) => cards[index]),
        ).mainboard;

        const pool = pickorder.slice();

        const newMainboard = [];

        for (const oracle of mainboardBuilt) {
          const poolIndex = pool.findIndex((cardindex) => cards[cardindex].oracle_id === oracle);
          if (poolIndex === -1) {
            // try basics
            const basicsIndex = basics.findIndex((cardindex) => cards[cardindex].oracle_id === oracle);
            if (basicsIndex !== -1) {
              newMainboard.push(basics[basicsIndex]);
            }
          } else {
            newMainboard.push(pool[poolIndex]);
            pool.splice(poolIndex, 1);
          }
        }

        // format mainboard
        const formattedMainboard = setupPicks(2, 8);
        const formattedSideboard = setupPicks(1, 8);

        for (const index of newMainboard) {
          const card = cards[index];
          const row =
            cardType(detailsToCard(card)).includes('Creature') || cardType(detailsToCard(card)).includes('Basic')
              ? 0
              : 1;
          const column = Math.max(0, Math.min(cardCmc(detailsToCard(card)), 7));

          formattedMainboard[row][column].push(index);
        }

        for (const index of pool) {
          if (!basics.includes(index)) {
            const card = cards[index];
            const column = Math.max(0, Math.min(cardCmc(detailsToCard(card)), 7));

            formattedSideboard[0][column].push(index);
          }
        }

        mainboard = formattedMainboard;
        sideboard = formattedSideboard;
      }

      const seat: DraftSeatType = {
        description: player.isBot
          ? `This deck was drafted by a bot on Draftmancer`
          : `This deck was drafted on Draftmancer by ${player.userName}`,
        mainboard,
        sideboard,
        pickorder,
        trashorder,
        owner: undefined,
        bot: player.isBot,
        name: '', // this will get set by the draft dao
      };

      seats.push(seat);
      draftmancerLog.players.push(draftmancerPicks);
    }

    const draft: Omit<DraftType, 'id'> = {
      name: 'Draftmancer Draft',
      seats,
      cards: cards.map((c) => detailsToCard(c)),
      cube: cube.id,
      InitialState: undefined, // we cannot calculate the initial state
      basics,
      seed: undefined, // we don't have a seed
      type: 'd', // we only support regular drafts for now
      owner: undefined, // anonymous, since we don't have a user
      cubeOwner: cube.owner,
      date: new Date().valueOf(),
      complete: true,
      DraftmancerLog: draftmancerLog,
    };

    const draftId = await Draft.put(draft);

    return res.status(200).send({
      draftId,
    });
  } catch (error) {
    // @ts-expect-error TODO: define request type with logger
    req.logger?.error('Error publishing draft', error);
    return res.status(500).json({ error: 'Error publishing draft' });
  }
};

export const routes = [
  {
    path: '/',
    method: 'post',
    handler: [validatePublishDraftBody, handler],
  },
];
