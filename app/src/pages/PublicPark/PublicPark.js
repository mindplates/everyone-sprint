import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button, PageTitle, SocketClient } from '@/components';
import { UserPropTypes } from '@/proptypes';
import './PublicPark.scss';
import request from '@/utils/request';

const viewer = React.createRef();
const userIconRadius = 20;
let clientRef = React.createRef();

const PublicPark = ({ user, t }) => {
  const [users, setUsers] = useState([]);
  const [enterUserId, setEnterUserId] = useState(false);
  const [dimension, setDimension] = useState({
    width: null,
    height: null,
  });

  const setup = () => {
    let svg = d3.select(viewer.current).select('svg');
    let group = null;

    const { width, height } = dimension;

    if (svg.size() < 1) {
      svg = d3.select(viewer.current).append('svg').attr('width', width).attr('height', height);
      const defs = svg.append('defs');
      defs
        .append('rect')
        .attr('id', 'rect-shape')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', userIconRadius * 2)
        .attr('height', userIconRadius * 2);

      defs
        .append('circle')
        .attr('id', 'circle-shape')
        .attr('cx', userIconRadius)
        .attr('cy', userIconRadius)
        .attr('r', userIconRadius);

      const rectClip = defs.append('clipPath').attr('id', 'rect-clip');
      rectClip.append('use').attr('xlink:href', '#rect-shape');

      const circleClip = defs.append('clipPath').attr('id', 'circle-clip');
      circleClip.append('use').attr('xlink:href', '#circle-shape');

      group = svg.append('g');
    } else {
      svg.attr('width', width).attr('height', height);
      group = svg.select('g');
    }

    const now = Date.now();
    users.forEach((u) => {
      const node = group.selectAll(`#user-${u.userId}`);

      if (node.size() > 0) {
        node.attr('dateUtil.js.js', `time-${now}`).attr('transform', `translate(${u.x}, ${u.y})`);
      } else if (u.imageType === 'image') {
        group
          .append('g')
          .attr('id', `user-${u.userId}`)
          .attr('transform', `translate(${u.x}, ${u.y})`)
          .attr('dateUtil.js.js', `time-${now}`)
          .append('svg:image')
          .style('border-radius', '50%')
          .attr('width', userIconRadius * 2)
          .attr('height', userIconRadius * 2)
          .attr('clip-path', 'url(#circle-clip)')
          .attr('xlink:href', u.imageData);
      } else {
        group
          .append('g')
          .attr('id', `user-${u.userId}`)
          .attr('transform', `translate(${u.x}, ${u.y})`)
          .attr('dateUtil.js.js', `time-${now}`)
          .append('circle')
          .attr('r', userIconRadius);
      }
    });

    const nodes = group.selectAll(`g:not([time=time-${now}])`);
    nodes.remove();
  };

  const getPosition = () => {
    const position = {};
    if (!position.x || !position.y) {
      const { width, height } = dimension;
      position.x = width / 2 - userIconRadius / 2 + Math.round((width / 10) * Math.random());
      position.y = height / 2 - userIconRadius / 2 + Math.round((height / 10) * Math.random());
    }
    return position;
  };

  const onChangeWindowSize = () => {
    const width = parseFloat(d3.select(viewer.current).style('width'));
    const height = parseFloat(d3.select(viewer.current).style('height'));
    setDimension({
      width,
      height,
    });
  };

  const send = (type, data) => {
    if (clientRef && clientRef.state && clientRef.state.connected) {
      clientRef.sendMessage('/pub/api/park/message/send', JSON.stringify({ type, data }));
      return true;
    }

    return false;
  };

  const enter = () => {
    if (user.id && enterUserId !== user.id) {
      const position = getPosition();
      if (send('PUBLIC-PARK-ENTER', position)) {
        setEnterUserId(user.id);
      }
    }
  };

  const getUser = (userId, info) => {
    return {
      userId,
      email: info.email,
      name: info.name,
      alias: info.alias,
      imageType: info.imageType,
      imageData: info.imageData,
      x: info.x,
      y: info.y,
    };
  };

  const onMessage = (info) => {
    const {
      senderInfo,
      data: { type, data },
    } = info;
    console.log(info);
    console.log(type, data, senderInfo);

    switch (type) {
      case 'PUBLIC-PARK-ENTER': {
        const nextUsers = users.slice(0);
        nextUsers.push(getUser(senderInfo.id, data));
        setUsers(nextUsers);

        break;
      }

      case 'PUBLIC-PARK-USER-MOVE': {
        const nextUsers = users.slice(0);
        const movedUser = nextUsers.find((u) => u.userId === senderInfo.id);
        if (movedUser) {
          movedUser.x = data.x;
          movedUser.y = data.y;
          setUsers(nextUsers);
        } else {
          nextUsers.push({
            userId: senderInfo.id,
            x: data.x,
            y: data.y,
          });
          setUsers(nextUsers);
        }

        break;
      }

      case 'PUBLIC-PARK-EXIT': {
        const nextUsers = users.slice(0);
        const userIndex = nextUsers.findIndex((u) => u.userId === senderInfo.id);
        if (userIndex > -1) {
          nextUsers.splice(userIndex, 1);
          setUsers(nextUsers);
        }

        break;
      }

      default: {
        break;
      }
    }
  };

  const getAllWalkers = () => {
    request.get('/api/park/walkers/all', null, (list) => {
      console.log(list);
      const nextUsers = users.slice(0);
      list.forEach((u) => {
        const exist = nextUsers.find((currentUser) => currentUser.userId === u.id);
        if (!exist) {
          nextUsers.push(getUser(u.id, u));
        }
      });
      setUsers(nextUsers);
    });
  };

  useEffect(() => {
    getAllWalkers();
  }, []);

  useEffect(() => {
    enter();

    window.addEventListener('resize', onChangeWindowSize);
    onChangeWindowSize();
    return () => {
      window.removeEventListener('resize', onChangeWindowSize);
    };
  }, [user]);

  useEffect(() => {
    enter();

    window.addEventListener('resize', onChangeWindowSize);
    onChangeWindowSize();
    return () => {
      window.removeEventListener('resize', onChangeWindowSize);
    };
  }, [user]);

  useEffect(() => {
    if (dimension.width && dimension.height) {
      setup();
    }
  }, [dimension]);

  useEffect(() => {
    if (dimension.width && dimension.height) {
      setup();
    }
  }, [users]);

  const move = (dir) => {
    const { width, height } = dimension;
    const next = users.slice(0);
    const target = next.find((d) => d.userId === user.id);

    if (target) {
      const position = {};
      position.x = target.x;
      position.y = target.y;
      if (dir === 'up') {
        position.y -= height / 20;
      } else if (dir === 'down') {
        position.y += height / 20;
      } else if (dir === 'left') {
        position.x -= width / 20;
      } else if (dir === 'right') {
        position.x += width / 20;
      }

      send('PUBLIC-PARK-USER-MOVE', position);
    }
  };

  console.log(users);

  return (
    <div className="public-park-wrapper g-content">
      <SocketClient
        topics={['/sub/public-park']}
        onMessage={onMessage}
        onConnect={() => {
          enter();
        }}
        onDisconnect={() => {}}
        setRef={(client) => {
          clientRef = client;
        }}
      />
      <PageTitle>모두의 공원</PageTitle>
      <div className="park-viewer g-page-content">
        <div ref={viewer} className="viewer" />
        {(!user || !user.id) && (
          <div className="message">
            <Link to="/starting-line">{t('참여하기 위해서는 로그인이 필요합니다.')}</Link>
          </div>
        )}
        {user && user.id && (
          <div className="controller">
            <Button
              rounded
              size="sm"
              onClick={() => {
                move('up');
              }}
            >
              <i className="fas fa-chevron-up" />
            </Button>
            <Button
              rounded
              size="sm"
              onClick={() => {
                move('down');
              }}
            >
              <i className="fas fa-chevron-down" />
            </Button>
            <Button
              rounded
              size="sm"
              onClick={() => {
                move('left');
              }}
            >
              <i className="fas fa-chevron-left" />
            </Button>
            <Button
              rounded
              size="sm"
              onClick={() => {
                move('right');
              }}
            >
              <i className="fas fa-chevron-right" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(PublicPark)));

PublicPark.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  user: UserPropTypes,
};
