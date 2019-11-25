import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import CDrivePathSelector from './CDrivePathSelector.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      path: "",
      showPathSelector: true,
    };
    this.togglePathSelector = this.togglePathSelector.bind(this);
    this.onPathChange = this.onPathChange.bind(this);
  }
  authenticateUser() {
    const cookies = new Cookies();
    var columbus_token = cookies.get('fahes_token');
    if (columbus_token !== undefined) {
      this.setState({isLoggedIn: true});
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
  onPathChange(path) {
    this.setState({path: path});
  }
  togglePathSelector() {
    this.setState({ showPathSelector:!this.state.showPathSelector });
  }
  render() {
    if (!this.state.isLoggedIn) {
      this.authenticateUser();
      return(null);
    } else {
      return(
        <div className="fahes-container" > 
          <CDrivePathSelector show={this.state.showPathSelector} 
            onPathChange={this.onPathChange} toggle={this.togglePathSelector} />
        </div>
      );
    }
  }
}

export default App;
