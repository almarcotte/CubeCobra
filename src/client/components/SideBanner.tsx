import React, { useContext } from 'react';

import UserContext from '../contexts/UserContext';
import Advertisment from './Advertisment';

interface SideBannerProps {
  placementId: string;
}

const SideBanner: React.FC<SideBannerProps> = ({ placementId }) => {
  const user = useContext(UserContext);

  if (user && Array.isArray(user.roles) && user.roles.includes('Patron')) return null;
  return <Advertisment placementId={placementId} size="side" media="desktop" format="sticky-stack" />;
};

export default SideBanner;
