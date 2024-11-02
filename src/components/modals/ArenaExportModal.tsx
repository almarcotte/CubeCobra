import Button from 'components/base/Button';
import { Flexbox } from 'components/base/Layout';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'components/base/Modal';
import Text from 'components/base/Text';
import TextArea from 'components/base/TextArea';
import CubeContext from 'contexts/CubeContext';
import FilterContext from 'contexts/FilterContext';
import CardDetails from 'datatypes/CardDetails';
import useAlerts, { Alerts } from 'hooks/UseAlerts';
import React, { useCallback, useContext, useState } from 'react';
import { sortForDownload } from 'utils/Sort';

interface ArenaExportModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isSortUsed: boolean;
  isFilterUsed: boolean;
}

const ArenaExportModal: React.FC<ArenaExportModalProps> = ({ isOpen, setOpen, isSortUsed, isFilterUsed }) => {
  const { alerts, addAlert } = useAlerts();
  const [text, setText] = useState('');
  const { cube, sortPrimary, sortSecondary, sortTertiary, sortQuaternary } = useContext(CubeContext);
  const { cardFilter } = useContext(FilterContext)!;

  const AFTERMATH_ORACLE_TEXT = 'Aftermath (Cast this spell only from your graveyard. Then exile it.)'.toLowerCase();

  //Component is being re-rendered a lot so the useCallback isn't doing much, though ideally it would optimize how often the export is generated
  const generateExport = useCallback(() => {
    generateArenaExport();
  }, [
    cube.cards.mainboard,
    isFilterUsed,
    isSortUsed,
    cardFilter,
    sortPrimary,
    sortSecondary,
    sortTertiary,
    sortQuaternary,
  ]);

  // console.log([cube.cards.mainboard,
  //   isFilterUsed,
  //   isSortUsed,
  //   cardFilter,
  //   sortPrimary,
  //   sortSecondary,
  //   sortTertiary,
  //   sortQuaternary,]);

  async function generateArenaExport() {
    console.log("Generate export");
    let cards = cube.cards.mainboard;
    if (isFilterUsed) {
      console.log("Filter used");
      cards = cards.filter(cardFilter.filter);
    }

    let sortedCards = cards;
    if (isSortUsed) {
      console.log("Sort used");
      //Use ?? in case the sorts are null. Undefined results in the defaults within sortForDownload being used
      sortedCards = sortForDownload(cards, sortPrimary ?? undefined, sortSecondary ?? undefined, sortTertiary ?? undefined, sortQuaternary ?? undefined, cube.showUnsorted);
    }

    let exportText = '';
    for (const card of sortedCards) {
      if (card.details == undefined) {
        continue;
      }
      /*
       * While card set and collector number can be imported to Arena, if the set is not available on Arena (or if in a different set code than paper),
       * it causes a failure to import for the card name. Thus we omit the information.
       */
      exportText += `1 ${getCardNameForArena(card.details)}\n`;
    }

    setText(exportText);
  }

  function getCardNameForArena(cardDetails: CardDetails) {
    let name = cardDetails.name;
    const oracleText = cardDetails.oracle_text;

    /*
     * Arena import (bug?) requires aftermath cards to be separated by three slashes not two. Normal split cards (and/or rooms) with 2 slashes are fine.
     * Best logic found so far is to check the oracle text has the full Aftermath keyword/reminder text.
     */
    if (oracleText.toLowerCase().includes(AFTERMATH_ORACLE_TEXT)) {
      name = name.replace(new RegExp("//", 'g'), '///');
    }
    return name;
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(text);
    addAlert('success', 'Copied to clipboard successfully.');
  }

  //Modal setOpen is when the background is clicked to close
  function onClose() {
    console.log("onClose");
    setOpen(isOpen);
    //Dismiss alerts
  }

  return (
    <Modal isOpen={isOpen} setOpen={onClose} md>
      <ModalHeader setOpen={setOpen}>Arena Export</ModalHeader>
      <ModalBody>
        <Text>Copy the textbox or use the Copy to clipboard button.</Text>
        <Alerts alerts={alerts} />
        <TextArea rows={10} placeholder="Copy Cube" value={text} disabled />
      </ModalBody>
      <ModalFooter>
        <Flexbox direction="row" justify="between" gap="2" className="w-full">
          <Button color="primary" block onClick={copyToClipboard}>
            Copy to clipboard
          </Button>
          <Button color="danger" onClick={onClose} block>
            Close
          </Button>
        </Flexbox>
      </ModalFooter>
    </Modal>
  );
};

export default ArenaExportModal;
