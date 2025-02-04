import React, { useMemo } from 'react';

import { COLORS } from 'utils/Util';

import Button from './base/Button';
import { Flexbox } from './base/Layout';
import Text from './base/Text';

interface ColorCheckButtonProps {
  size?: string;
  color: string;
  short: string;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ColorCheckButton: React.FC<ColorCheckButtonProps> = ({
  color,
  short,
  checked,
  onClick,
  disabled = false,
}) => {
  const symbolClassName = 'mana-symbol';
  return (
    <Button
      className={`color-check-button${checked ? ' active' : ''}`}
      outline={!checked}
      onClick={onClick}
      aria-label={color}
      color="secondary"
      disabled={disabled}
    >
      <img src={`/content/symbols/${short.toLowerCase()}.png`} alt={color} title={color} className={symbolClassName} />
    </Button>
  );
};

interface ColorChecksControlProps {
  colorless?: boolean;
  values: string[];
  setValues: (values: string[]) => void;
}

export const ColorChecksControl: React.FC<ColorChecksControlProps> = ({ colorless = false, values, setValues }) => {
  return (
    <Flexbox direction="row" gap="1">
      <Text md semibold>
        Colors:
      </Text>
      {COLORS.map(([color, short]) => (
        <ColorCheckButton
          key={short}
          color={color}
          short={short}
          checked={values.includes(short)}
          onClick={() => {
            if (!values.includes(short)) {
              setValues([...new Set([...values, short])].filter((c) => c !== 'C'));
            } else {
              setValues(values.filter((c) => c !== short));
            }
          }}
        />
      ))}
      {colorless && (
        <ColorCheckButton
          color="Colorless"
          short="C"
          checked={values.includes('C')}
          onClick={() => {
            if (!values.includes('C')) {
              setValues(['C']);
            } else {
              setValues([]);
            }
          }}
        />
      )}
    </Flexbox>
  );
};

export interface ColorChecksAddonProps {
  colorless?: boolean;
  size?: string;
  values: string[];
  setValues: (values: string[]) => void;
  label?: string;
  disabled?: boolean;
}

export const ColorChecksAddon: React.FC<ColorChecksAddonProps> = ({
  colorless = false,
  size = 'sm',
  label,
  values = [],
  setValues,
  disabled = false,
}) => {
  const colors = useMemo(() => {
    const c = [...COLORS];
    if (colorless) {
      c.push(['Colorless', 'C']);
    }
    return c;
  }, [colorless]);

  return (
    <div className="block w-full">
      {label && <label className="block text-sm font-medium text-text">{label}</label>}
      <Flexbox direction="row" gap="1">
        {colors.map(([color, short]) => (
          <ColorCheckButton
            key={short}
            size={size}
            color={color}
            short={short}
            checked={values.includes(short)}
            onClick={() => {
              if (!values.includes(short)) {
                setValues([...new Set([...values, short])]);
              } else {
                setValues(values.filter((c) => c !== short));
              }
            }}
            disabled={disabled}
          />
        ))}
      </Flexbox>
    </div>
  );
};
