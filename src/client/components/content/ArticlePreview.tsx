import React from 'react';

import TimeAgo from 'react-timeago';

import AspectRatioBox from 'components/base/AspectRatioBox';
import MtgImage from 'components/MtgImage';
import Article from 'datatypes/Article';

import { Flexbox } from '../base/Layout';
import Text from '../base/Text';
import { Tile } from '../base/Tile';

const statusMap: Record<string, string> = {
  p: 'Published',
  d: 'Draft',
  r: 'In Review',
};

export interface ArticlePreviewProps {
  article: Article;
  showStatus?: boolean;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, showStatus = false }) => {
  return (
    <Tile href={article.status === 'p' ? `/content/article/${article.id}` : `/content/article/edit/${article.id}`}>
      <AspectRatioBox ratio={1.9}>
        {article.image && <MtgImage image={article.image} />}
        <Text bold className="absolute bottom-0 left-0 text-white text-shadow bg-article bg-opacity-50 w-full mb-0 p-1">
          Article
          {showStatus && ` - Status: ${statusMap[article.status]}`}
        </Text>
      </AspectRatioBox>
      <Flexbox direction="col" className="p-1 flex-grow">
        <Text semibold md className="truncate">
          {article.title}
        </Text>
        <Flexbox direction="row" justify="between">
          <Text sm className="text-text-secondary">
            Written by {article.owner.username}
          </Text>
          <Text sm className="text-text-secondary">
            <TimeAgo date={article.date} />
          </Text>
        </Flexbox>
        <div className="flex-grow">
          <Text area sm>
            {article.short}
          </Text>
        </div>
      </Flexbox>
    </Tile>
  );
};

export default ArticlePreview;
