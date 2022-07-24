import React from "react";
import axios from "axios";
import { Map, GoogleApiWrapper, InfoWindow, Marker } from "google-maps-react";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      lat: 0,
      lng: 0,
      type: "restaurant",
      radius: 5,
      places: [],
      marker: [],
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
    };
  }

  locatorBtnPressed = async () => {
    navigator.geolocation.getCurrentPosition((position) =>
      this.setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    );
  };

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
      selectedPlaceRating: e.rating,
    });

  onClose = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };

  //To fetch data from Google Place API
  findNearMe = () => {
    const URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
      this.state.lat
    },${this.state.lng}&type=${this.state.type}&radius=${
      this.state.radius * 1000
    }&key=AIzaSyBdjAuhBcj1SsrMu31DCBGhTzeNEsuX18U`;
    axios
      .get(URL)
      .then((response) => {
        this.setState({
          places: response.data.results,
        });
        this.addLocationToGoogleMap(response.data.results);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  //To make marker over the Google Map
  addLocationToGoogleMap = (places) => {
    var mark = [];
    places.map((place) =>
      mark.push(
        <Marker
          position={{
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          }}
          key={place.place_id}
          name={place.name}
          rate={place.rating}
          onClick={this.onMarkerClick}
        />
      )
    );
    this.setState({
      marker: mark,
    });
  };

  render() {
    //First time automatically call to take user location
    this.locatorBtnPressed();

    return (
      <div className="ui grid">
        <div className="six wide column">
          <div className="ui segment large form">
            <div className="ui segment">
              <div className="field">
                <div className="ui right icon input large">
                  <input
                    type="text"
                    placeholder="Enter your address"
                    v-model="coordinates"
                    readOnly
                    value={
                      this.state.lat === 0
                        ? "Loading..."
                        : this.state.lat + ", " + this.state.lng
                    }
                  />
                  <i
                    className="map marker alternate icon link blue"
                    onClick={this.locatorBtnPressed}
                  ></i>
                </div>
              </div>
              <div className="field">
                <div className="two fields">
                  <div className="field">
                    <select
                      v-model="type"
                      onChange={(e) => this.setState({ type: e.target.value })}
                    >
                      <option value="restaurant">Restaurant</option>
                    </select>
                  </div>
                  <div className="field">
                    <select
                      onChange={(e) =>
                        this.setState({ radius: e.target.value })
                      }
                      v-model="radius"
                    >
                      <option value="5">5 KM</option>
                      <option value="10">10 KM</option>
                      <option value="15">15 KM</option>
                      <option value="20">20 KM</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={this.findNearMe}
                className="ui animated button green small"
              >
                <div className="visible content">Find Near</div>
                <div className="hidden content">
                  <i className="search icon"></i>
                </div>
              </button>
            </div>
          </div>
          {this.state.marker.length > 0 ? (
            <div
              className="ui segment"
              style={{ height: "100vh", overflow: "scroll" }}
            >
              <div className="ui divided items">
                {this.state.places.map((e) => {
                  return (
                    <div className="item" key={e.place_id}>
                      <div className="content">
                        <div className="ui grid">
                          <div className="three wide column">
                            <img
                              alt=""
                              src={e.icon}
                              className="ui small image"
                            ></img>
                          </div>
                          <div className="eleven wide column">
                            <div className="header">{e.name}</div>
                            <div className="meta">{e.vicinity}</div>
                          </div>
                          <div className="two wide column">
                            <a
                              target="_blank"
                              el="noreferrer"
                              href={`https://www.google.com/maps/search/${e.name.replace(
                                " ",
                                "+"
                              )}/@${e.geometry.location.lat},${
                                e.geometry.location.lng
                              },17z/data=!3m1!4b1!4m5!3m4!1s0x3bae124aada8863b:0xfe7b88571ad49adf!8m2!3d${
                                e.geometry.location.lat
                              }!4de.geometry.location.lng`}
                            >
                              <i
                                style={{ fontSize: "20px" }}
                                className="location arrow icon link green"
                              ></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="ten wide column segment ui" style={{ height: "100vh" }}>
          {this.state.lat === 0 ? (
            <div className="ui active dimmer">
              <div className="ui text loader">Loading</div>
            </div>
          ) : this.state.marker.length > 0 ? (
            <Map
              google={this.props.google}
              zoom={14}
              style={{
                width: "95%",
                height: "95vh",
                padding: "40px",
              }}
              initialCenter={{
                lat: this.state.lat,
                lng: this.state.lng,
              }}
            >
              {this.state.marker}
              <InfoWindow
                marker={this.state.activeMarker}
                visible={this.state.showingInfoWindow}
                onClose={this.onClose}
              >
                <div>
                  <p>{this.state.selectedPlace.name}</p>
                  <p className="">
                    <i style={{ color: "#FDCC0D" }} className="star icon"></i>{" "}
                    {this.state.selectedPlace.rate}
                  </p>
                </div>
              </InfoWindow>
            </Map>
          ) : (
            <Map
              google={this.props.google}
              zoom={14}
              style={{
                width: "95%",
                height: "95vh",
                padding: "40px",
              }}
              initialCenter={{
                lat: this.state.lat,
                lng: this.state.lng,
              }}
            ></Map>
          )}
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyBdjAuhBcj1SsrMu31DCBGhTzeNEsuX18U",
})(App);
