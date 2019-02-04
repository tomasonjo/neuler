import React, { Component } from 'react'
import { Sidebar, Menu, Segment, Icon, Image, Header } from "semantic-ui-react"

import './App.css'

import AlgorithmsGroupMenu from "./components/AlgorithmGroupsMenu"
import { selectAlgorithm } from "./ducks/algorithms"
import { connect } from "react-redux"
import { getAlgorithms } from "./components/algorithmsLibrary"
import MainContent from './components/MainContent'

import {
  GraphAppBase,
  CONNECTED,
  ConnectModal
} from 'graph-app-kit/components/GraphAppBase';

import {Cypher} from 'graph-app-kit/components/Cypher'

import { Render } from 'graph-app-kit/components/Render';

import Neo4jDesktopStandIn from './neo4jDesktop/Neo4jDesktopStandIn';

import { v1 as neo4j } from 'neo4j-driver'

import * as PropTypes from "prop-types";

class NEuler extends Component {
  // static contextType = DriverContext;

  static contextTypes = {
        driver: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
  }

  state = {
    status: 'groups',
    content: 'centralities'
  }

  handleMenuClick (content) {
    this.setState({content})
  }

  render() {
    const {content} = this.state
    const { activeGroup, activeAlgorithm, selectAlgorithm } = this.props
    console.log(this.context.driver)

    return (
      <Sidebar.Pushable as={Segment}>
        <Sidebar
          as={Menu}
          animation='push'
          direction='left'
          icon='labeled'
          inverted
          vertical
          visible={true}
          width='thin'
        >
          <AlgorithmsGroupMenu/>
        </Sidebar>

        <Sidebar.Pusher>
          <Segment basic inverted vertical={false} style={{ height: '5em', display: 'flex', width:'90%', justifyContent: 'space-between' }}>
            <Menu inverted>
              {getAlgorithms(activeGroup).map(algorithm =>
                <Menu.Item key={algorithm} as='a' active={activeAlgorithm === algorithm} onClick={() => selectAlgorithm(algorithm)}>
                  {algorithm}
                </Menu.Item>)}
            </Menu>
            <Header as='h1' inverted color='grey' style={{marginTop: '0'}}>
              NEuler
            </Header>
          </Segment>

          <MainContent />

        </Sidebar.Pusher>
      </Sidebar.Pushable>
    )
  }
}

class App extends Component {
  render() {
    const localDriver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo"));
return (
            <GraphAppBase
              driverFactory={neo4j}
              integrationPoint={window.neo4jDesktopApi}
              render={({ connectionState, connectionDetails, setCredentials, initialDesktopContext }) => {
                return (
                  <NEuler key="app" {...this.props} data={connectionDetails} connected={connectionState === CONNECTED} />
                );
              }}
            />
          )
  }
}

const mapStateToProps = state => ({
  activeGroup: state.algorithms.group,
  activeAlgorithm: state.algorithms.algorithm
})

const mapDispatchToProps = dispatch => ({
  selectAlgorithm: algorithm => dispatch(selectAlgorithm(algorithm))
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
