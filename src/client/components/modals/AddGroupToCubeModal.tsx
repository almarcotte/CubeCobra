import React, { useCallback, useContext, useState } from 'react';

import { detailsToCard } from 'utils/cardutil';

import { CardDetails } from '../../../datatypes/Card';
import CubePropType from '../../../datatypes/Cube';
import { CSRFContext } from '../../contexts/CSRFContext';
import Alert from '../base/Alert';
import Button from '../base/Button';
import CardList from '../base/CardList';
import { Flexbox } from '../base/Layout';
import { Modal, ModalBody, ModalFooter,ModalHeader } from '../base/Modal';
import Select from '../base/Select';
import LoadingButton from '../LoadingButton';

export interface AddGroupToCubeModalProps {
  cards: CardDetails[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  cubes: CubePropType[];
  packid?: string;
}

interface AlertProps {
  color: string;
  message: string;
}

const AddGroupToCubeModal: React.FC<AddGroupToCubeModalProps> = ({ cards, isOpen, setOpen, cubes, packid = null }) => {
  const { csrfFetch } = useContext(CSRFContext);
  const [selectedCube, setSelectedCube] = useState<string | null>(cubes && cubes.length > 0 ? cubes[0].id : null);
  const [alerts, setAlerts] = useState<AlertProps[]>([]);
  const [board, setBoard] = useState<'mainboard' | 'maybeboard'>('mainboard');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const add = useCallback(async () => {
    setLoadingSubmit(true);
    try {
      const response = await csrfFetch(`/cube/api/addtocube/${selectedCube}`, {
        method: 'POST',
        body: JSON.stringify({
          cards: cards.map((card) => card.scryfall_id),
          packid,
          board,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success === 'true') {
          setOpen(false);
        }
      } else {
        setAlerts([...alerts, { color: 'danger', message: 'Error, could not add card' }]);
      }
    } catch {
      setAlerts([...alerts, { color: 'danger', message: 'Error, could not add card' }]);
    }
    setLoadingSubmit(false);
  }, [selectedCube, cards, packid, board, alerts, setOpen]);

  if (!cubes || cubes.length === 0) {
    return (
      <Modal isOpen={isOpen} setOpen={setOpen} sm>
        <ModalHeader setOpen={setOpen}>Add Package to Cube</ModalHeader>
        <ModalBody>
          <CardList cards={cards.map(detailsToCard)} />
          <p>You don't appear to have any cubes to add this card to. Are you logged in?</p>
        </ModalBody>
        <ModalFooter>
          <Button block color="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} setOpen={setOpen} sm>
      <ModalHeader setOpen={setOpen}>Add Package to Cube</ModalHeader>
      <ModalBody>
        <Flexbox direction="col" gap="2">
          {alerts.map(({ color, message }) => (
            <Alert key={message} color={color} className="mt-2">
              {message}
            </Alert>
          ))}
          <CardList cards={cards.map(detailsToCard)} />
          <Select
            label="Cube"
            value={selectedCube ?? ''}
            setValue={(value) => setSelectedCube(value)}
            options={cubes.map((cube) => ({ value: cube.id, label: cube.name }))}
          />
          <Select
            label="Board"
            value={board}
            setValue={(value) => setBoard(value as 'mainboard' | 'maybeboard')}
            options={[
              { value: 'mainboard', label: 'Mainboard' },
              { value: 'maybeboard', label: 'Maybeboard' },
            ]}
          />
        </Flexbox>
      </ModalBody>
      <ModalFooter>
        <Flexbox direction="row" gap="2" className="w-full">
          <LoadingButton block loading={loadingSubmit} color="primary" onClick={() => add()}>
            Add
          </LoadingButton>
          <Button block color="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Flexbox>
      </ModalFooter>
    </Modal>
  );
};

export default AddGroupToCubeModal;
