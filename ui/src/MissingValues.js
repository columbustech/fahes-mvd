import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import './MissingValues.css';

class MissingValues extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isExecuting: true,
      jsondata: [],
      cdrivePath: ""
    };
    this.handlePathChange = this.handlePathChange.bind(this);
    this.saveToCdrive = this.saveToCdrive.bind(this);
  }
  componentDidMount() {
    const request = axios({
      method: 'POST',
      url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/execute/",
      data: {
        name: this.props.name,
      }
    });
    request.then(
      response => {
        const req = axios({
          method: 'GET',
          url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/results/?name=" + this.props.name,
        });
        req.then(
          resp => {
            this.setState({
              jsondata: resp.data,
              isExecuting: false
            });
          },
        );
      },
    );
  }
  handlePathChange(event){
    this.setState({cdrivePath: event.target.value});
  }
  saveToCdrive() {
    const cookies = new Cookies();
    const request = axios({
      method: 'POST',
      url: window.location.protocol + "//" + window.location.hostname + window.location.pathname + "api/save/",
      data: {
        access_token: cookies.get('fahes_token'),
        name: this.props.name,
        path: this.state.cdrivePath
      }
    });
    request.then(
        response => {
          //this.setState({isSaved: true});
          console.log("Saved to CDrive");
        },
    );
  }
  render() {
    if(this.state.isExecuting) {
      return(null);
    } else {
      var keys = Object.keys(this.state.jsondata[0]);

      let headers;

      headers = keys.map((key, index) => {
        return (<th>{key}</th>);
      });

      var rows = [];
      this.state.jsondata.forEach((jsonrow, i) => {
        let rowdata;
        rowdata = Object.keys(jsonrow).map((key, index) => {
          return (<td>{jsonrow[key]}</td>);
        });
        rows.push(<tr>{rowdata}</tr>);
      });

      var downloadLinks = 
        <div>
          <button className="btn btn-primary">Download to Local</button>
          <div class="input-group mt-3">
            <input type="text" placeholder="Enter CDrive Path" value={this.state.cdrivePath} onChange={this.handlePathChange} />
            <div class="input-group-append">
              <button className="btn btn-primary btn-lg" onClick={this.saveToCdrive}> Save to CDrive </button> 
            </div>
          </div>
        </div> ;
      return (
        <div>
          <div className="csv-table" >
            <table className="table table-bordered">
              <thead>
                <tr>
                  {headers}
                </tr>
              </thead>
              <tbody>
                  {rows}
              </tbody>
            </table>
          </div>
          {downloadLinks}
        </div>
      );
    }
  }
}

export default MissingValues;

