import React from 'react';
import ReactDOM from 'react-dom';

export class GoogleSearchBox extends React.Component {
  render() {
    return <input ref="input" {...this.props} type="text"/>;
  }
  onPlacesChanged = () => {
    if (this.props.onPlacesChanged) {
      this.props.onPlacesChanged(this.searchBox.getPlaces());
    }
  }
  componentDidMount() {
    setTimeout(() => {
      var input = ReactDOM.findDOMNode(this.refs.input);
      this.searchBox = new google.maps.places.SearchBox(input);
      this.searchBox.addListener('places_changed', this.onPlacesChanged);
    }, 3000)
  }
  componentWillUnmount() {
    // https://developers.google.com/maps/documentation/javascript/events#removing
    google.maps.event.clearInstanceListeners(this.searchBox);
  }
}
