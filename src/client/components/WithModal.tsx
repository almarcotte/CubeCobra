import React, { ComponentProps, ComponentType, ElementType, MouseEvent, ReactNode, useCallback, useState } from 'react';

// If the modal is controlled, modalprops should include isOpen and toggle. If not, the component will create its own.
export interface WithModalProps<U> {
  children?: ReactNode;
  className?: string;
  modalprops?: Omit<U, 'setOpen' | 'isOpen' | 'toggle'>;
  altClick?: () => void;
  //Commonly would set stopProgagation to true if the button to open the modal lives within another clickable block like a row
  stopProgagation?: boolean;
}

const withModal = <T extends ElementType, U>(Tag: T, ModalTag: ComponentType<U>) => {
  const Result: React.FC<WithModalProps<U> & ComponentProps<T>> = (allProps: WithModalProps<U> & ComponentProps<T>) => {
    const { children, className, modalprops = {}, altClick, stopProgagation } = allProps;
    const [isOpen, setIsOpen] = useState(false);
    const toggle = useCallback(
      (event?: MouseEvent<HTMLElement>) => {
        if (event) {
          event.preventDefault();
        }
        setIsOpen(!isOpen);
      },
      [isOpen],
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        // only prevent default if ctrl wasn't pressed
        if (altClick && event.ctrlKey) {
          return altClick();
        }

        if (stopProgagation) {
          event.stopPropagation();
        }

        event.preventDefault();
        return toggle();
      },
      [altClick, stopProgagation, toggle],
    );

    return (
      <>
        <Tag
          {...(allProps as any)}
          className={className ? `${className} clickable` : 'clickable'}
          onClick={handleClick}
        >
          {children}
        </Tag>
        <ModalTag isOpen={isOpen} setOpen={setIsOpen} toggle={toggle} {...modalprops} />
      </>
    );
  };
  Result.displayName = `withModal(${typeof Tag === 'function' ? Tag.displayName : Tag.toString()})`;
  return Result;
};

export default withModal;
