import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { FaFile, FaFolder } from 'react-icons/fa';

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
    this.getDriveObjects(this.state.path);
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
    this.onPathChange(this.state.path + "/" + this.state.driveObjects[this.state.selectedIndex].name);
    this.toggle();
  }
  render() {
    var tokens = this.state.path.split("/");
    let items;

    items = tokens.map((token, i) => {
      if(i === tokens.length - 1){
        return (<li className="breadcrumb-item active" aria-current="page"><button className="btn" disabled>{token}</button></li>);
      } else {
        return (<li className="breadcrumb-item"><button onClick={() => this.breadcrumbClick(i)} className="btn btn-link">{token}</button></li>);
      }
    });
    let folderList;
    if(this.state.driveObjects.length !== 0) {
      let rows;
      rows = this.state.driveObjects.map((dobj, i) => {
        if (dobj.type === "Folder") {
          return (
            <li key={i} onClick={e => this.listClick(e, i)}>
              <div>
                <FaFolder style={{marginRight: 6}} size={25} color="#92cefe" />
                {dobj.name}
              </div>
            </li>
          );
        } else {
          return (
            <li key={i} onClick={e => this.listClick(e, i)}>
              <div>
                <FaFile style={{marginRight: 6 }} size={25} color="#9c9c9c" />
                {dobj.name}
              </div>
            </li>
          );
        }
      });
      folderList = (
        <ul>
          {rows}
        </ul>
      );
    }
    return(
      <Modal show={this.props.show} onHide={this.props.toggle}>
        <Modal.Header closeButton>
          <Modal.Title>Select CSV File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-transparent">
              {items}
            </ol>
          </nav>
          <div className="folder-list">
            {folderList}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.toggle}>
            Close
          </Button>
          <Button variant="primary" onClick={this.selectFile}>
            Select
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CDrivePathSelector;
