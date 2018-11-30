import React from 'react';
import cx from 'classnames';

import ObservedImage from '../../../ObservedImage';

import { enumerateCollectibleState } from '../../../destinyEnums';

class Collectibles extends React.Component {
  constructor(props) {
    super(props);

    this.scrollToRecordRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.quaternaryHash && this.scrollToRecordRef.current !== null) {
      window.scrollTo({
        top: this.scrollToRecordRef.current.offsetTop + this.scrollToRecordRef.current.offsetHeight / 2 - window.innerHeight / 2
      });
    }
  }

  render() {
    let manifest = this.props.manifest;

    let characterCollectibles = this.props.state.response.profile.characterCollectibles.data;
    let profileCollectibles = this.props.state.response.profile.profileCollectibles.data.collectibles;
    let characterId = this.props.route.match.params.characterId;

    let tertiaryDefinition = manifest.DestinyPresentationNodeDefinition[this.props.tertiaryHash];

    let highlightHash = this.props.quaternaryHash;

    let tertiaryChildren = [];
    if (tertiaryDefinition.children.presentationNodes.length > 0) {
      tertiaryDefinition.children.presentationNodes.forEach(node => {
        let nodeDefinition = manifest.DestinyPresentationNodeDefinition[node.presentationNodeHash];

        let row = [];
        let rowState = [];

        nodeDefinition.children.collectibles.forEach(child => {
          let collectibleDefinition = manifest.DestinyCollectibleDefinition[child.collectibleHash];

          let state;
          if (profileCollectibles[child.collectibleHash]) {
            state = profileCollectibles[child.collectibleHash].state;
          } else if (characterCollectibles[characterId].collectibles[child.collectibleHash]) {
            state = characterCollectibles[characterId].collectibles[child.collectibleHash].state;
          } else {
            state = 0;
          }

          rowState.push(state);

          row.push(
            <li
              key={collectibleDefinition.hash}
              className={cx('item', 'tooltip', {
                completed: !enumerateCollectibleState(state).notAcquired && !enumerateCollectibleState(state).invisible
              })}
              data-itemhash={collectibleDefinition.itemHash}
            >
              <div className='icon'>
                <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
              </div>
            </li>
          );
        });

        tertiaryChildren.push(
          <li
            key={nodeDefinition.hash}
            className={cx('is-set', {
              completed: rowState.filter(collectible => !enumerateCollectibleState(collectible).notAcquired).length === rowState.length
            })}
          >
            <div className='set'>
              <ul className='list'>{row}</ul>
            </div>
            <div className='text'>
              <div className='name'>{nodeDefinition.displayProperties.name}</div>
            </div>
          </li>
        );
      });
    } else {
      tertiaryDefinition.children.collectibles.forEach(child => {
        let collectibleDefinition = manifest.DestinyCollectibleDefinition[child.collectibleHash];

        let state;
        if (profileCollectibles[child.collectibleHash]) {
          state = profileCollectibles[child.collectibleHash] ? profileCollectibles[child.collectibleHash].state : 0;
        } else if (characterCollectibles[characterId].collectibles[child.collectibleHash]) {
          state = characterCollectibles[characterId].collectibles[child.collectibleHash] ? characterCollectibles[characterId].collectibles[child.collectibleHash].state : 0;
        } else {
          state = 0;
        }

        if (enumerateCollectibleState(state).invisible) {
          return;
        }
        // eslint-disable-next-line eqeqeq
        let ref = highlightHash == collectibleDefinition.hash ? this.scrollToRecordRef : null;

        if (collectibleDefinition.redacted) {
          tertiaryChildren.push(
            <li
              key={collectibleDefinition.hash}
              ref={ref}
              className={cx('redacted', 'tooltip', {
                // eslint-disable-next-line eqeqeq
                highlight: highlightHash && highlightHash == collectibleDefinition.hash
              })}
              data-itemhash='343'
            >
              <div className='icon'>
                <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
              </div>
              <div className='text'>
                <div className='name'>Classified</div>
              </div>
            </li>
          );
        } else {
          tertiaryChildren.push(
            <li
              key={collectibleDefinition.hash}
              ref={ref}
              className={cx('tooltip', {
                completed: !enumerateCollectibleState(state).notAcquired,
                // eslint-disable-next-line eqeqeq
                highlight: highlightHash && highlightHash == collectibleDefinition.hash
              })}
              data-itemhash={collectibleDefinition.itemHash}
            >
              <div className='icon'>
                <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${collectibleDefinition.displayProperties.icon}`} />
              </div>
              <div className='text'>
                <div className='name'>{collectibleDefinition.displayProperties.name}</div>
              </div>
            </li>
          );
        }
      });
    }

    return tertiaryChildren;
  }
}

export default Collectibles;
