import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Link from 'gatsby-link'
import styled from 'emotion/react'

import { createPanes, PageContainer } from '../layouts/containers'
import {
  sansfont,
  monofont,
  Header1,
  breakpoint1,
  breakpoint2,
  breakpoint3,
} from '../layouts/emotion-base'
import HiddenSelector from '../layouts/HiddenSelector'
import DesignerProjects from '../layouts/DesignerProjects'
import DesignerBio from '../layouts/DesignerBio'
import ImageList from '../layouts/ImageList'
import HoverInfo from '../layouts/HoverInfo'
import PieceSummary from '../layouts/PieceSummary'
import { pieceImagePath, pieceImageTexts, designerLink } from '../util'

const { LeftPane, RightPane } = createPanes('370px')

const WorksHeader = styled.h2`
  composes: ${sansfont};
  margin: 0 0 16px 0;
  padding: 0;
  font-weight: 500;
  font-size: 36px;

  @media (${breakpoint1}) {
    margin: 8px 0 28px 0;
    font-size: 24px;
  }
`

export default class DesignerTemplate extends Component {
  constructor(props) {
    super(props)

    this.imageHoverHandler = this.imageHoverHandler.bind(this)

    this.state = {
      hoverImage: null,
    }
  }

  imageHoverHandler(hoverImage) {
    this.setState({ hoverImage: hoverImage || null })
  }

  render() {
    const { data, pathContext } = this.props
    const { allProjectsYaml, allDesignersYaml } = data
    const { slug: currentDesignerSlug } = pathContext
    const { hoverImage } = this.state

    const designers = allDesignersYaml.edges.map(edge => edge.node)
    const currentDesigner = designers.find(d => d.slug === currentDesignerSlug)

    const projects = allProjectsYaml.edges
      .map(edge => edge.node)
      .filter(project => project.designers.includes(currentDesignerSlug))

    let images = []
    currentDesigner.pieces.forEach(piece => {
      images.push({
        piece,
        src: pieceImagePath(piece.images[0]),
        texts: pieceImageTexts({
          designer: currentDesigner,
          piece,
          projects,
        }),
      })
    })

    // TODO: remove image multiplication
    for (let i = 0; i < 3; i++) {
      images = images.concat(images)
    }

    const imagesByProject = projects.map(project => ({
      project,
      images: images.filter(image =>
        image.piece.projects.includes(project.slug)
      ),
    }))

    // include pieces w/o project
    imagesByProject.push({
      project: null,
      images: images.filter(image => image.piece.projects.length === 0),
    })

    let imageSets = imagesByProject
      .filter(item => item.images.length > 0)
      .map(({ project, images }) => ({
        title: project ? project.title : null,
        images,
      }))

    // TODO: remove image set multiplication
    for (let i = 0; i < 2; i++) {
      imageSets = imageSets.concat(imageSets.slice(0, 1))
    }

    const selectorItems = designers.map(item => ({
      title: item.name,
      link: designerLink(item.slug),
    }))

    const selectorSections = [{ items: selectorItems }]

    return (
      <PageContainer>
        <Helmet
          title={`Salon 94 Design - Designers — ${currentDesigner.name}`}
        />
        <LeftPane>
          <WorksHeader>Works</WorksHeader>
          <ImageList
            imageSets={imageSets}
            onImageHover={this.imageHoverHandler}
          />
        </LeftPane>
        <RightPane className="selectable">
          <Header1>
            {currentDesigner.name}
          </Header1>
          <DesignerProjects projects={projects} />
          <DesignerBio bio={currentDesigner.bio} />
          <HiddenSelector
            title="All Designers"
            sections={selectorSections}
            currentItemLink={designerLink(currentDesigner.slug)}
          />
          {hoverImage &&
            <HoverInfo>
              <PieceSummary piece={hoverImage.piece} />
            </HoverInfo>}
        </RightPane>
      </PageContainer>
    )
  }
}

export const pageQuery = graphql`
  query DesignerTemplateQuery {
    allProjectsYaml {
      edges {
        node {
          slug
          title
          designers
        }
      }
    }
    allDesignersYaml(sort: { order: ASC, fields: [name] }) {
      edges {
        node {
          slug
          name
          bio
          pieces {
            slug
            title
            when
            projects
            tags
            images
            caption
            price
          }
        }
      }
    }
  }
`
