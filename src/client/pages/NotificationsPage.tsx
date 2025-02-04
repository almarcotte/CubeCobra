import React, { useCallback, useContext, useState } from 'react';

import Banner from 'components/Banner';
import { Card, CardBody, CardHeader } from 'components/base/Card';
import { Flexbox } from 'components/base/Layout';
import Pagination from 'components/base/Pagination';
import Text from 'components/base/Text';
import DynamicFlash from 'components/DynamicFlash';
import Notification from 'components/nav/Notification';
import RenderToRoot from 'components/RenderToRoot';
import { CSRFContext } from 'contexts/CSRFContext';
import NotificationType from 'datatypes/Notification';
import MainLayout from 'layouts/MainLayout';

interface NotificationsPageProps {
  notifications: NotificationType[];
  lastKey?: string;
  loginCallback?: string;
}

const PAGE_SIZE = 18;

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, lastKey, loginCallback }) => {
  const [items, setItems] = useState<NotificationType[]>(notifications);
  const { csrfFetch } = useContext(CSRFContext);
  const [currentLastKey, setLastKey] = useState(lastKey);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = React.useState(0);

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const hasMore = !!currentLastKey;

  const fetchMoreData = useCallback(async () => {
    setLoading(true);
    const response = await csrfFetch(`/user/getmorenotifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastKey: currentLastKey,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success === 'true') {
        setItems([...items, ...json.notifications]);
        setPage(page + 1);
        setLastKey(json.lastKey);
      }
    }
    setLoading(false);
  }, [csrfFetch, currentLastKey, items, page]);

  const pager = (
    <Pagination
      count={pageCount}
      active={page}
      hasMore={hasMore}
      onClick={async (newPage) => {
        if (newPage >= pageCount) {
          await fetchMoreData();
        } else {
          setPage(newPage);
        }
      }}
      loading={loading}
    />
  );
  return (
    <MainLayout loginCallback={loginCallback}>
      <Banner />
      <DynamicFlash />
      <Card className="my-3">
        <CardHeader>
          <Flexbox direction="row" justify="between" alignItems="center" className="w-full">
            <Text lg semibold>
              Notifications ({items.length}
              {hasMore ? '+' : ''})
            </Text>
            {items.length > 0 && pager}
          </Flexbox>
        </CardHeader>
        {items.length > 0 ? (
          items
            .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            .map((notification) => <Notification key={notification.id} notification={notification} />)
        ) : (
          <p className="m-2">
            You don't have any notifications! Why don't you try sharing your cube on the{' '}
            <a href="https://discord.gg/YYF9x65Ane">Cube Cobra Discord?</a>
          </p>
        )}
        <CardBody>
          <Flexbox direction="row" justify="end" alignItems="center" className="w-full">
            {pager}
          </Flexbox>
        </CardBody>
      </Card>
    </MainLayout>
  );
};

export default RenderToRoot(NotificationsPage);
