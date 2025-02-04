import React, { useState } from 'react';

import Button from 'components/base/Button';
import { Card, CardBody, CardHeader } from 'components/base/Card';
import Collapse from 'components/base/Collapse';
import { Col, Flexbox,Row } from 'components/base/Layout';
import Link from 'components/base/Link';
import Text from 'components/base/Text';
import CubePreview from 'components/cube/CubePreview';
import Cube from 'datatypes/Cube';

interface CubesCardProps {
  cubes: Cube[];
  title: string;
  children?: React.ReactNode;
  sideLink?: {
    href: string;
    text: string;
  };
  lean?: boolean;
  alternateViewFewer?: React.ReactNode;
  [key: string]: any; // To allow additional props
}

const CubesCard: React.FC<CubesCardProps> = ({
  children,
  cubes,
  title,
  sideLink,
  lean = false,
  alternateViewFewer,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Card {...props}>
      <CardHeader className="cubes-card-header">
        <Flexbox direction="row" justify="between">
          <Text semibold lg>
            {title}
          </Text>
          {sideLink && <Link href={sideLink.href}>{sideLink.text}</Link>}
        </Flexbox>
      </CardHeader>
      <Row gutters={0}>
        {cubes.slice(0, 2).map((cube) => (
          <Col key={cube.id} xs={6}>
            <CubePreview cube={cube} />
          </Col>
        ))}
      </Row>
      <Collapse isOpen={isOpen}>
        <Row gutters={0}>
          {cubes.slice(2).map((cube) => (
            <Col key={cube.id} xs={6}>
              <CubePreview cube={cube} />
            </Col>
          ))}
        </Row>
      </Collapse>
      {(!lean || cubes.length > 2) && (
        <CardBody>
          {alternateViewFewer ? (
            <>
              {isOpen ? (
                alternateViewFewer
              ) : (
                <Button color="primary" block onClick={toggle}>
                  View More...
                </Button>
              )}
            </>
          ) : (
            <Button color="primary" block onClick={toggle}>
              {isOpen ? 'View Fewer...' : 'View More...'}
            </Button>
          )}
        </CardBody>
      )}
      {children}
    </Card>
  );
};

export default CubesCard;
