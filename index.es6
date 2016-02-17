import React from 'react';
/* eslint-disable id-match */
import { findDOMNode as findDomNode } from 'react-dom';
/* eslint-enable id-match */
import { getClosestDppx } from './get-dppx';
import { addElementResizeListener, removeElementResizeListener } from './element-resize-listener';
import { addElementScrollListener, removeElementScrollListener } from './element-scroll-listener';
import isVisible from './is-visible';
export default class Picture extends React.Component {

  defaultProps = {
    alt: '',
    sources: [],
  }

  constructor() {
    super(...arguments);
    this.changeImageByWidth = this.changeImageByWidth.bind(this);
  }

  componentDidMount() {
    const element = findDomNode(this);
    const { sources } = this.props;
    const dppx = getClosestDppx(sources);
    const image = element.firstChild;
    image.onload = () => {
      element.classList.remove('picture--default');
    };
    this.state = { dppx };
    addElementResizeListener(element, this.changeImageByWidth);
    addElementScrollListener(element, this.changeImageByWidth);
    this.changeImageByWidth(element.offsetWidth, element.offsetHeight);
  }

  componentWillUnmount() {
    removeElementResizeListener(findDomNode(this), this.changeImageByWidth);
    removeElementScrollListener(findDomNode(this), this.changeImageByWidth);
  }

  changeImageByWidth(width, height) {
    const { dppx } = this.state;
    const element = findDomNode(this);
    if (!isVisible(element)) {
      return;
    }
    const bestFitImage = this.props.sources.reduce((leftSource, rightSource) => {
      if (Math.abs(rightSource.dppx - dppx) < Math.abs(leftSource.dppx - dppx)) {
        return rightSource;
      }
      const rightSourceWidthDelta = Math.abs(rightSource.width - width);
      const leftSourceWidthDelta = Math.abs(leftSource.width - width);
      if (rightSourceWidthDelta === leftSourceWidthDelta) {
        const rightSourceHeightDelta = Math.abs(rightSource.height - height);
        const leftSourceHeightDelta = Math.abs(leftSource.height - height);
        return (rightSourceHeightDelta < leftSourceHeightDelta) ? rightSource : leftSource;
      }
      return (rightSourceWidthDelta < leftSourceWidthDelta) ? rightSource : leftSource;
    }, this.props.sources[0]);
    this.setState(bestFitImage);
  }

  render() {
    const { url } = this.state || {};
    const { sources, className, alt, ...remainingProps } = this.props;
    const imageProps = { alt, src: url };
    const wrapperProps = {
      ...remainingProps,
      className: [ 'picture', 'picture--default' ].concat(className).join(' ').trim(),
    };
    return (
      <div {...wrapperProps}>
        <img {...imageProps}/>
      </div>
    );
  }
}

if (process.env.NODE_ENV !== 'production') {
  Picture.propTypes = {
    className: React.PropTypes.string,
    alt: React.PropTypes.string.isRequired,
    sources: React.PropTypes.arrayOf(React.PropTypes.shape({
      url: React.PropTypes.string.isRequired,
      width: React.PropTypes.number.isRequired,
      height: React.PropTypes.number.isRequired,
      dppx: React.PropTypes.number.isRequired,
    })).isRequired,
  };
}
