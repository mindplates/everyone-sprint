import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Color from 'color-js';
import { useResizeDetector } from 'react-resize-detector';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { PageContent } from '@/components';
import './Message.scss';

const Message = ({ t, code }) => {
  const [trees, setTrees] = useState([]);

  const onResize = useCallback((width) => {
    const maxCount = Math.floor(width / 50);
    const minCount = 4;

    const list = [];
    const count = minCount + Math.round(Math.random() * (maxCount - minCount));
    const seeds = d3.scaleOrdinal(['rgb(254,201,54)', 'rgb(35,162,145)', 'rgb(239,94,97)', 'rgb(91,103,118)']);
    const sameColorMap = {};

    for (let i = 0; i < count; i += 1) {
      const color = seeds(i);
      if (!sameColorMap[color]) {
        sameColorMap[color] = 1;
      } else {
        sameColorMap[color] += 1;
      }

      list.push({
        size: Math.round(2 + Math.random() * 2),
        opacity: 0.5 + Math.random() * 0.5,
        animationDuration: 2 + Math.random() * 3,
        animationDelay: 2 + Math.random() * 2,
        color: Color(color)
          .shiftHue(sameColorMap[color] * 35)
          .toCSS(),
      });
    }

    setTrees(list);
  }, []);

  const { ref: element } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 500,
    onResize,
  });

  return (
    <div className="message-wrapper g-content g-has-no-title" ref={element}>
      <PageContent className="message-content" border={false} padding="0">
        {code === '404' && (
          <div className="page-not-found">
            <div className="message-title">{t('404')}</div>
            <div className="message-desc">{t('페이지를 찾을 수 없습니다.')}</div>
          </div>
        )}
        <div className="bg">
          <div>
            {trees.map((d, inx) => {
              return (
                <span
                  key={inx}
                  style={{
                    fontSize: `${d.size}rem`,
                    opacity: d.opacity,
                    color: d.color,
                    animationDuration: `${d.animationDuration}s`,
                    animationDelay: `${d.animationDelay}s`,
                  }}
                >
                  <i className="fas fa-tree" />
                </span>
              );
            })}
          </div>
        </div>
      </PageContent>
    </div>
  );
};

export default compose(withRouter, withTranslation())(Message);

Message.propTypes = {
  t: PropTypes.func,
  code: PropTypes.string,
};
