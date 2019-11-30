import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import CDrivePathSelector from './CDrivePathSelector.js';
import MissingValues from './MissingValues.js';
import CSVSample from './CSVSample.js';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      name: "",
      activeStepIndex: 0,
      specs: {}
    };
    this.getSpecs = this.getSpecs.bind(this);
    this.onPathSelect= this.onPathSelect.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
  }
  getSpecs() {
    const request = axios({
      method: 'GET',
      url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/specs/"
    });
    request.then(
      response => {
        this.setState({specs: response.data});
      },
    );
  }
  authenticateUser() {
    const cookies = new Cookies();
    var columbus_token = cookies.get('fahes_token');
    if (columbus_token !== undefined) {
      var auth_header = 'Bearer ' + cookies.get('fahes_token');
      const request = axios({
        method: 'GET',
        url: "https://api.cdrive.columbusecosystem.com/user-details/",
        headers: {'Authorization': auth_header}
      });
      request.then(
        response => {
          this.setState({isLoggedIn: true});
        }, err => {
          cookies.remove('fahes_token');
          this.authenticateUser();
        }
      );
      return(null);
    }
    var url_string = window.location.href;
    var url = new URL(url_string);
    var code = url.searchParams.get("code");
    var redirect_uri = this.state.specs.cdriveUrl + "app/" + this.state.specs.username + "/fahes-mvd/";
    if (code == null) {
      window.location.href = this.state.specs.authUrl + "o/authorize/?response_type=code&client_id=" + this.state.specs.clientId + "&redirect_uri=" + redirect_uri + "&state=1234xyz";
    } else {
      const request = axios({
        method: 'POST',
        url: redirect_uri + "api/authentication-token/",
        data: {
          code: code,
          redirect_uri: redirect_uri
        }
      });
      request.then(
        response => {
          cookies.set('fahes_token', response.data.access_token);
          this.setState({isLoggedIn: true});
        },
        err => {
        }
      );
    }
  }
  onPathSelect(path) {
    const cookies = new Cookies();
    let auth_header = 'Bearer ' + cookies.get('columbus_token');
    const request = axios({
      method: 'GET',
      url: "https://api.cdrive.columbusecosystem.com/download/?path=" + path,
      headers: {'Authorization': auth_header}
    });
    var name = path.substring(path.lastIndexOf("/") + 1);
    request.then(
      response => {
        const req = axios({
          method: 'POST',
          url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/upload/",
          data: {
            url: response.data.download_url,
            name: name
          }
        });
        req.then(
          resp => {
            this.setState({
              name: name,
              activeStepIndex: 2
            });
          },
        );
      },
    );
  }
  render() {
    if (Object.keys(this.state.specs).length === 0) {
      this.getSpecs();
      return(null);
    } else if (!this.state.isLoggedIn) {
      this.authenticateUser();
      return(null);
    } else {
      let component, header;
      switch(this.state.activeStepIndex) {
        case 0:
          component = (
            <CDrivePathSelector specs={this.state.specs} onPathSelect={this.onPathSelect} />
          );
          header = (
            <h1 className="h3 mb-3 font-weight-light">Choose an {"input"} file {"for"} missing value detection</h1>
          );
          break;
        case 1:
          component = (
            <CSVSample />
          );
          break;
        case 2:
          component = (
            <MissingValues specs={this.state.specs} name={this.state.name} />
          );
          header = (
            <h1 className="h3 mb-3 font-weight-light">Missing Values</h1>
          );
          break;
        default:
          component = "";
          header = "";
      }
      return(
        <div className="fahes-container" > 
          {header}
          {component}
        </div>
      );
    }
  }
}

export default App;
