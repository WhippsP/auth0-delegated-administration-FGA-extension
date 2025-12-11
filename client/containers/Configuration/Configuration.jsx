import React, { Component, PropTypes } from 'react';
import { LoadingPanel, Error, Json } from 'auth0-extension-ui';

import connectContainer from 'redux-static';
import { Tabs, Tab } from 'react-bootstrap';
import { scriptActions } from '../../actions';

import Editor from '../../components/Editor';
import './Configuration.css';
import getErrorMessage from '../../utils/getErrorMessage';

export default connectContainer(class extends Component {
  static stateToProps = (state) => ({
    scripts: state.scripts,
    settings: (state.settings.get('record') && state.settings.get('record').toJS().settings) || {},
    languageDictionary: state.languageDictionary && state.languageDictionary.get('record').toJS()
  });

  static actionsToProps = {
    ...scriptActions
  }

  static propTypes = {
    scripts: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    fetchScript: PropTypes.func.isRequired,
    updateScript: PropTypes.func.isRequired,
    languageDictionary: PropTypes.object
  }

  static defaultProps = {
    languageDictionary: {}
  }

  constructor(props) {
    super(props);

    this.state = {
      activeTab: 1,
      code: { }
    };
  }

  shouldComponentUpdate(nextProps) {
    return this.props.scripts !== nextProps.scripts;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.scripts) {
      const code = this.state.code;
      const scripts = nextProps.scripts.toJS();
      Object.keys(scripts).forEach(scriptName => {
        if (!code[scriptName]) {
          code[scriptName] = scripts[scriptName].script;
        }
      });

      this.setState({
        code
      });
    }
  }

  componentWillMount = () => {
    this.props.fetchScript('access');
    this.props.fetchScript('filter');
    this.props.fetchScript('create');
    this.props.fetchScript('memberships');
    this.props.fetchScript('settings');
  };

  saveScript = (name) => () => {
    this.props.updateScript(name, this.state.code[name]);
  };

  onEditorChanged = (name) => (value) => {
    const code = this.state.code;
    code[name] = value;

    this.setState({
      code
    });
  };

  render() {
    const code = this.state.code;
    const scripts = this.props.scripts.toJS();
    const { languageDictionary, settings } = this.props;
    const originalTitle = (settings.dict && settings.dict.title) || window.config.TITLE || 'User Management';
    document.title = `${languageDictionary.configurationMenuItemText || 'Configuration'} - ${originalTitle}`;

    return (
      <div className="configuration">
        <div className="row content-header">
          <div className="col-xs-12 user-table-content">
            <h2>Configuration</h2>
            <p>This configuration page allows you to fine tune the behavior of the Delegated Administration dashboard. More information and examples of hooks are available <a href="https://auth0.com/docs/extensions/delegated-admin">on the documentation page</a>.</p>
          </div>
        </div>
        <div className="row configuration-tabs">
          <div className="col-xs-12">
            <Tabs defaultActiveKey={this.state.activeTab} animation={false} id="configuration-tabs" >
              <Tab eventKey={1} title={code.filter && code.filter.length ? <span>Access FGA Model</span> : <i>Access FGA Model</i>}>
                <LoadingPanel show={scripts.filter && scripts.filter.loading} animationStyle={{ paddingTop: '5px', paddingBottom: '5px' }}>
                  <Error title={languageDictionary.errorTitle} message={getErrorMessage(languageDictionary, scripts.filter && scripts.filter.error)} />
                  <p>
                    The <strong>Access FGA Model</strong> allows you to specify the FGA Model used to allow authorization to user objects.
                    There are 3 relationships supported (View, Access and Write). The user object types supported are User, Admin, Operator, Auditor 
                  </p>
                  <Editor
                    value={code.filter || ''}
                    onChange={this.onEditorChanged('filter')}
                  />
                  <div className="save-config">
                    <button onClick={this.saveScript('filter')} className="btn btn-success">Save Model
                    </button>
                  </div>
                </LoadingPanel>
              </Tab>
              <Tab eventKey={4} title={code.memberships && code.memberships.length ? <span>Memberships Hook</span> : <i>Memberships Hook</i>}>
                <LoadingPanel show={scripts.memberships && scripts.memberships.loading} animationStyle={{ paddingTop: '5px', paddingBottom: '5px' }}>
                  <Error title={languageDictionary.errorTitle} message={getErrorMessage(languageDictionary, scripts.memberships && scripts.memberships.error)} />
                  <p>
                    With the <strong>membership query</strong> you can specify in which groups the current user can
                    create new users. Only in their own department? Or other departments also?
                  </p>
                  <Editor
                    value={code.memberships || ''}
                    onChange={this.onEditorChanged('memberships')}
                  />
                  <div className="save-config">
                    <button onClick={this.saveScript('memberships')} className="btn btn-success">
                      Save Memberships Query
                    </button>
                  </div>
                </LoadingPanel>
              </Tab>
              <Tab eventKey={5} title={code.settings && code.settings.length ? <span>Settings Query</span> : <i>Settings Query</i>}>
                <LoadingPanel show={scripts.settings && scripts.settings.loading} animationStyle={{ paddingTop: '5px', paddingBottom: '5px' }}>
                  <Error title={languageDictionary.errorTitle} message={getErrorMessage(languageDictionary, scripts.settings && scripts.settings.error)} />
                  <p>
                    With the <strong>settings query</strong> you can control the title and the look-and-feel of the
                    dashboard after the user has logged in?
                  </p>
                  <Editor
                    value={code.settings || ''}
                    onChange={this.onEditorChanged('settings')}
                  />
                  <div className="save-config">
                    <button onClick={this.saveScript('settings')} className="btn btn-success">
                      Save Settings Query
                    </button>
                  </div>
                </LoadingPanel>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
});
