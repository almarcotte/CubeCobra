import React, { useContext, useMemo } from 'react';

import { cardImageUrl } from 'utils/cardutil';

import Card from '../../../datatypes/Card';
import { CardDetails } from '../../../datatypes/Card';
import DisplayContext from '../../contexts/DisplayContext';
import ImageFallback from '../ImageFallback';
import withAutocard from '../WithAutocard';

const ImageAutocard = withAutocard<typeof ImageFallback>(ImageFallback);

export interface CardImageProps {
  card?: Card;
  details?: CardDetails;
  autocard?: boolean;
  className?: string;
  width?: string;
  height?: string;
  onClick?: () => void;
}

const CardImage: React.FC<CardImageProps> = ({
  card,
  autocard = false,
  className,
  details,
  width,
  height,
  onClick,
}) => {
  const current = useMemo<Card>(() => {
    const result: Card = card || {
      cardID: '',
      details: {} as CardDetails,
    };

    if (details) {
      result.details = details;
      result.cardID = details.oracle_id;
    }

    return result;
  }, [card, details]);

  const { showCustomImages } = useContext(DisplayContext);
  const imageSrc = (showCustomImages && cardImageUrl(current)) || current.details?.image_normal;

  if (autocard) {
    return (
      <ImageAutocard
        card={current}
        src={imageSrc}
        fallbackSrc="/content/default_card.png"
        alt={current.details?.name}
        width={width ?? '100%'}
        height={height ?? 'auto'}
        className={className}
        onClick={onClick}
      />
    );
  }

  return (
    <ImageFallback
      src={imageSrc}
      fallbackSrc="/content/default_card.png"
      alt={card?.details?.name}
      width={width ?? '100%'}
      height={height ?? 'auto'}
      className={className}
      onClick={onClick}
    />
  );
};

export default CardImage;
