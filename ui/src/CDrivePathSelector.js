import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { FaFile, FaFolder } from 'react-icons/fa';
import './CDrivePathSelector.css';

class CDrivePathSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: "users",
      driveObjects: [],
      selectedIndex: -1
    };
    this.getDriveObjects = this.getDriveObjects.bind(this);
    this.breadcrumbClick = this.breadcrumbClick.bind(this);
    this.listClick = this.listClick.bind(this);
    this.selectFile = this.selectFile.bind(this);
  }
  componentDidMount() {
    this.getDriveObjects("users/" + this.props.specs.username);
  }
  getDriveObjects(path) {
    const cookies = new Cookies();
    var auth_header = 'Bearer ' + cookies.get('fahes_token');
    const request = axios({
      method: 'GET',
      url: "https://api.cdrive.columbusecosystem.com/list/?path=" + path,
      headers: {'Authorization': auth_header}
    });
    request.then(
      response => {
        this.setState({
          driveObjects: response.data.driveObjects,
          path: path
        });
      },
    );
  }
  breadcrumbClick(index) {
    var tokens = this.state.path.split("/");
    var newPath = tokens.slice(0,index+1).join("/");
    this.getDriveObjects(newPath);
  }
  listClick(e, index) {
    var newPath;
      if (this.state.driveObjects[index].type === "Folder") {
        newPath = this.state.path + "/" + this.state.driveObjects[index].name;
        this.getDriveObjects(newPath);
      } else if (this.state.driveObjects[index].type === "File") {
        newPath = this.state.path + "/" + this.state.driveObjects[index].name;
        this.setState({selectedIndex:index});
      }
  }
  selectFile() {
    var fileName = this.state.driveObjects[this.state.selectedIndex].name;
    var newPath = this.state.path + "/" + fileName;
    this.props.onPathSelect(newPath);
  }
  render() {
    var tokens = this.state.path.split("/");
    let items;

    items = tokens.map((token, i) => {
      if(i === tokens.length - 1){
        return (
          <li className="breadcrumb-item active" aria-current="page">
            <button className="btn" disabled>{token}</button>
          </li>
        );
      } else {
        return (
          <li className="breadcrumb-item">
            <button onClick={() => this.breadcrumbClick(i)} className="btn btn-link">
              {token}
            </button>
          </li>
        );
      }
    });
    let rows;
    if(this.state.driveObjects.length !== 0) {
      rows = this.state.driveObjects.map((dobj, i) => {
        var name = dobj.name;
        if (name.length > 10) {
          name = name.substring(0,7) + "...";
        }
        if (dobj.type === "Folder") {
          return (
            <div className="folder-item drive-item" onClick={e => this.listClick(e, i)}>
              <div>
                <FaFolder size={60} color="#92cefe" />
              </div>
              <div className="drive-item-name">
                {name}
              </div>
            </div>
          );
        } else {
          if (i === this.state.selectedIndex) {
            return (
              <div  className="file-item drive-item" onClick={e => this.listClick(e, i)}>
                <div className="selected-item">
                  <FaFile size={60} color="#9c9c9c" />
                </div>
                <div className="drive-item-name selected-item">
                  {name}
                </div>
              </div>
            );
          } else {
            return (
              <div  className="file-item drive-item" onClick={e => this.listClick(e, i)}>
                <div>
                  <FaFile size={60} color="#9c9c9c" />
                </div>
                <div className="drive-item-name">
                  {name}
                </div>
              </div>
            );
          }
        }
      });
    }
    return(
      <div className="cdrive-path-selector" >
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb bg-transparent">
            {items}
          </ol>
        </nav>
        <div className="folder-list">
          {rows}
        </div>
        <div className="select-submit" >
          <button className="btn btn-primary btn-lg" onClick={this.selectFile}>
            Detect Missing Values
          </button>
          <button className="btn btn-secondary btn-lg ml-5" >
            View CSV Sample
          </button>
        </div>
      </div>
    );
  }
}

export default CDrivePathSelector;
