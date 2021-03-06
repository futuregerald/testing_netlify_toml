import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import styled from 'emotion/react'
import cx from 'classnames'
import Scroll from 'react-scroll'
import {
  monofont,
  sansfont,
  childLink,
  breakpoint1,
  breakpoint3,
} from './emotion-base'

const ImageSet = styled.div`
  &:not(:last-child) {
    margin-bottom: 60px;

    @media (${breakpoint1}) {
      margin-bottom: 30px;
    }
  }

  &.unexpandable {
    margin-right: -20px;

    @media (${breakpoint3}) {
      margin-right: 0;
    }
  }
`

const SetTitle = styled.h3`
  composes: ${sansfont};
  margin: 0 72px 28px 0;
  font-weight: 400;
  font-size: 28px;
  text-align: right;

  @media (${breakpoint1}) {
    text-align: left;
    font-size: 22px;
    margin: 0 0 28px 0;
  }

  @media (${breakpoint3}) {
    margin: 0 0 20px 0;
  }
`

const ImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-end;
  box-sizing: border-box;
`

const ImageItem = styled.div`
  margin: 0 20px 20px 0;
  display: inline-block;

  & img {
    margin: 0;
    padding: 0;
    max-width: 144px;
    max-height: 144px;
    cursor: pointer;
  }

  &.expanded {
    padding-right: 20px;

    & img {
      max-width: 100%;
      max-height: 100%;
      cursor: default;
    }
  }

  @media (${breakpoint3}) {
    margin: 0 0 20px 0;

    &.expanded {
      padding-right: 0;
    }

    & img,
    &.expanded img {
      max-width: none;
      max-height: none;
      width: 100%;
      cursor: default;
    }
  }
`

const ImageTextContainer = styled.div`
  composes: ${sansfont};
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  &.compact {
    .expanded-text {
      display: none;
    }
  }

  &.expanded {
    .small {
      display: none;
    }
  }

  @media (${breakpoint3}) {
    & .small {
      display: none;
    }

    &.compact .expanded-text {
      display: block;
    }
  }
`

const ImageText = styled.div`
  composes: ${childLink};
  text-align: left;
  width: 50%;
  font-size: 18px;
  line-height: 28px;

  &.right {
    text-align: right;
  }

  &.primary {
    font-size: 24px;
  }

  &.small {
    width: 100%;
    font-size: 12px;
    line-height: 1;
  }

  @media (${breakpoint3}) {
    font-size: 15px;
    line-height: 24px;
    width: auto;

    &.primary {
      font-size: 18px;
      order: -2;
    }

    &.credit {
      order: -1;
    }

    &.data-texts,
    &.caption {
      width: 100%;
      text-align: right;
    }
  }
`

const ImageTextData = styled.span`
  display: inline-block;

  &:not(:last-child) {
    margin-right: 24px;
  }

  @media (${breakpoint3}) {
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
`

const ExpansionButton = styled.button`
  composes: ${monofont};
  position: fixed;
  right: 50px;
  bottom: 50px;
  cursor: pointer;
  font-size: 96px;
  background: none;
  border: none;
  outline: none;
  user-select: none;

  @media (${breakpoint1}) {
    bottom: 30px;
    right: 0;
  }

  @media (${breakpoint3}) {
    display: none;
  }
`

class ImageList extends Component {
  constructor(props) {
    super(props)

    this.onKeyDown = this.onKeyDown.bind(this)

    this.state = {
      isExpanded: props.alwaysExpand ? true : false,
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown(ev) {
    // if expanded and ESC pressed, unexpand
    if (this.state.isExpanded && ev.keyCode === 27) {
      this.unexpand()
    }
  }

  renderExpansionButton() {
    const { isExpanded } = this.state

    if (!isExpanded) {
      return null // no longer show the "O" open state
    }

    const onClick = () => {
      if (!this.state.isExpanded) {
        this.setState({ isExpanded: true })
      } else {
        this.unexpand()
      }
    }

    return (
      <ExpansionButton onClick={onClick}>
        {isExpanded ? 'x' : 'o'}
      </ExpansionButton>
    )
  }

  onImageClick(setIndex, imageIndex) {
    if (this.props.unexpandable || this.state.isExpanded) return

    if (this.props.onImageHover) {
      this.props.onImageHover(null)
    }

    this.setState({ isExpanded: true }, () => {
      this.scrollTo(`set-${setIndex}-image-${imageIndex}`, -24)
    })
  }

  unexpand() {
    if (this.props.alwaysExpand) {
      return
    }

    this.setState({ isExpanded: false }, () => {
      this.scrollTo('set-0-image-0', -170) // scroll to top
    })
  }

  scrollTo(name, offset = 0) {
    Scroll.scroller.scrollTo(name, {
      duration: 100,
      smooth: true,
      offset,
    })
  }

  render() {
    const { imageSets, onImageHover, alwaysExpand, unexpandable } = this.props
    const { isExpanded } = this.state

    return (
      <section>
        {!alwaysExpand && !unexpandable && this.renderExpansionButton()}

        {imageSets.map(({ images, title }, setIndex) =>
          <ImageSet key={setIndex} className={cx({ unexpandable })}>
            {title &&
              <SetTitle>
                {title}
              </SetTitle>}

            <ImageContainer>
              {images.map((image, i) => {
                const { src, texts, unexpandedLink, alt = '' } = image

                const onMouseEnter =
                  isExpanded || !onImageHover ? null : () => onImageHover(image)
                const onMouseLeave =
                  isExpanded || !onImageHover ? null : () => onImageHover(null)
                const img = (
                  <img
                    src={src}
                    alt={alt}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  />
                )

                const textContainerClass = cx({
                  expanded: isExpanded,
                  compact: !isExpanded,
                })

                return (
                  <Scroll.Element
                    name={`set-${setIndex}-image-${i}`}
                    key={`image-${i}`}
                  >
                    <ImageItem
                      className={cx({ expanded: isExpanded })}
                      onClick={() => this.onImageClick(setIndex, i)}
                    >
                      {isExpanded || !unexpandedLink
                        ? img
                        : <Link to={unexpandedLink}>
                            {img}
                          </Link>}

                      {texts &&
                        <ImageTextContainer className={textContainerClass}>
                          {texts.smallText &&
                            <ImageText className="small">
                              {texts.smallText}
                            </ImageText>}

                          <ImageText className="expanded-text left primary">
                            {texts.title}
                          </ImageText>
                          <ImageText className="expanded-text right data-texts">
                            {texts.data.map(txt =>
                              <ImageTextData key={txt}>
                                {txt}
                              </ImageTextData>
                            )}
                          </ImageText>
                          <ImageText className="expanded-text left caption">
                            {texts.caption}
                          </ImageText>
                          <ImageText className="expanded-text right credit">
                            {texts.credit}
                          </ImageText>
                        </ImageTextContainer>}
                    </ImageItem>
                  </Scroll.Element>
                )
              })}
            </ImageContainer>
          </ImageSet>
        )}
      </section>
    )
  }
}

ImageList.propTypes = {
  imageSets: PropTypes.array.isRequired,
  onImageHover: PropTypes.func,
  alwaysExpand: PropTypes.bool,
  unexpandable: PropTypes.bool,
}

export default ImageList
