import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { Button, PageTitle } from '@/components';
import './PublicPark.scss';

const viewer = React.createRef();
const r = 10;

const PublicPark = () => {
  const [users, setUsers] = useState([]);
  const [dimension, setDimension] = useState({
    width: null,
    height: null,
  });

  const setup = () => {
    const svg = d3.select(viewer.current).select('svg');
    let group = null;

    const { width, height } = dimension;

    if (svg.size() < 1) {
      group = d3.select(viewer.current).append('svg').attr('width', width).attr('height', height).append('g');
    } else {
      svg.attr('width', width).attr('height', height);
      group = svg.select('g');
    }

    const now = Date.now();
    users.forEach((u) => {
      const node = group.selectAll(`#user-${u.id}`);

      if (node.size() > 0) {
        node
          .attr('time', `time-${now}`)
          .transition()
          .duration(200)
          .attr('cx', u.x)
          .transition()
          .duration(200)
          .attr('cy', u.y)
          .style('stroke', u.color)
          .style('fill', u.backgroundColor);
      } else {
        group
          .append('circle')
          .attr('id', `user-${u.id}`)
          .attr('time', `time-${now}`)
          .attr('r', r)
          .attr('cx', u.x)
          .attr('cy', u.y)
          .style('stroke', u.color)
          .style('stroke-width', 4)
          .style('fill', u.backgroundColor);
      }
    });

    const nodes = group.selectAll(`circle:not([time=time-${now}])`);
    nodes.remove();
  };

  const getUser = (user) => {
    if (!user.x || !user.y) {
      const { width, height } = dimension;
      user.x = width / 2 - r / 2 + Math.round((width / 10) * Math.random());
      user.y = height / 2 - r / 2 + Math.round((height / 10) * Math.random());
    }
    return user;
  };

  const onChangeWindowSize = () => {
    const width = parseFloat(d3.select(viewer.current).style('width'));
    const height = parseFloat(d3.select(viewer.current).style('height'));
    setDimension({
      width,
      height,
    });
  };

  useEffect(() => {
    const list = [];
    list.push({ id: 1, name: '케빈', x: null, y: null, color: '#333', backgroundColor: 'transparent' });
    list.push({ id: 2, name: '알렉스', x: null, y: null, color: '#E64402', backgroundColor: 'green' });
    setUsers(list);

    window.addEventListener('resize', onChangeWindowSize);
    onChangeWindowSize();
    return () => {
      window.removeEventListener('resize', onChangeWindowSize);
    };
  }, []);

  useEffect(() => {
    if (dimension.width && dimension.height) {
      const next = users.slice(0);
      next.forEach((d) => {
        if (!d.x || !d.y) {
          d = getUser(d);
        }
      });
      setUsers(next);
      setup();
    }
  }, [dimension]);

  useEffect(() => {
    if (dimension.width && dimension.height) {
      setup();
    }
  }, [users]);

  const move = (id, dir) => {
    const { width, height } = dimension;
    const next = users.slice(0);
    if (dir === 'up') {
      const target = next.find((d) => d.id === id);
      target.y -= height / 20;
    } else if (dir === 'down') {
      const target = next.find((d) => d.id === id);
      target.y += height / 20;
    } else if (dir === 'left') {
      const target = next.find((d) => d.id === id);
      target.x -= width / 20;
    } else if (dir === 'right') {
      const target = next.find((d) => d.id === id);
      target.x += width / 20;
    }

    setUsers(next);
  };

  const addUser = (id) => {
    const next = users.slice(0);
    next.push(getUser({ id, name: '알렉스', x: null, y: null, color: '#E64402', backgroundColor: 'green' }));
    setUsers(next);
  };

  const removeUser = (id) => {
    const next = users.slice(0);
    const index = next.findIndex((d) => d.id === id);
    if (index > -1) {
      next.splice(index, 1);
    }

    setUsers(next);
  };

  return (
    <div className="public-park-wrapper">
      <PageTitle>모두의 공원</PageTitle>
      <div className="park-viewer">
        <div ref={viewer} className="viewer" />
        <div className="controller">
          <Button
            rounded
            size="sm"
            onClick={() => {
              removeUser(2);
            }}
          >
            <i className="fas fa-minus" />
          </Button>
          <Button
            rounded
            size="sm"
            onClick={() => {
              addUser(3);
            }}
          >
            <i className="fas fa-plus" />
          </Button>
          <Button
            rounded
            size="sm"
            onClick={() => {
              move(1, 'up');
            }}
          >
            <i className="fas fa-chevron-up" />
          </Button>
          <Button
            rounded
            size="sm"
            onClick={() => {
              move(1, 'down');
            }}
          >
            <i className="fas fa-chevron-down" />
          </Button>
          <Button
            rounded
            size="sm"
            onClick={() => {
              move(1, 'left');
            }}
          >
            <i className="fas fa-chevron-left" />
          </Button>
          <Button
            rounded
            size="sm"
            onClick={() => {
              move(1, 'right');
            }}
          >
            <i className="fas fa-chevron-right" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(PublicPark);

PublicPark.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),

  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
