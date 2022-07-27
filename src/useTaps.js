export function getSetTaps(value) {
    let taps = value;
  
    function get() {
      return taps;
    }
  
    function set(newTaps) {
      if (taps === newTaps) return;
      taps = newTaps;
    }
  
    return {
      get,
      set,
    };
  }