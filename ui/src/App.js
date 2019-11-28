import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import CDrivePathSelector from './CDrivePathSelector.js';
import MissingValues from './MissingValues.js';
import CSVSample from './CSVSample';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      name: "",
      activeStepIndex: 0
    };
    this.onPathSelect= this.onPathSelect.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
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
    var redirect_uri = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
    if (code == null) {
      const request = axios({
        method: 'GET',
        url: redirect_uri + "api/client-id/"
      });
      request.then(
        response => {
          var client_id = response.data.client_id;
          window.location.href = "https://authentication.columbusecosystem.com/o/authorize/?response_type=code&client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&state=1234xyz";
        },
      );
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
    if (!this.state.isLoggedIn) {
      this.authenticateUser();
      return(null);
    } else {
      let component;
      switch(this.state.activeStepIndex) {
        case 0:
          component = (
            <CDrivePathSelector onPathSelect={this.onPathSelect} />
          );
          break;
        case 1:
          component = (
            <CSVSample />
          );
          break;
        case 2:
          component = (
            <MissingValues name={this.state.name} />
          );
          break;
        default:
          component = "";
      }
      return(
        <div className="fahes-container" > 
          {component}
        </div>
      );
    }
  }
}

export default App;
