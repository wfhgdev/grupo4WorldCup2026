// Spanish dictionary aggregator
// Combines all sub-dictionaries into a single window.__DICT object
(function() {
  window.__DICT = window.__DICT || {};
  
  // Merge all dictionary sources
  var dict = {};
  
  function merge(source) {
    if (!source) return;
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        dict[key] = source[key];
      }
    }
  }
  
  merge(window.__TEAMS_ES);
  merge(window.__ENUMS_ES);
  merge(window.__COMPETITION_ES);
  merge(window.__UI_ES);
  
  window.__DICT = dict;
  
  // Clean up globals to free memory
  delete window.__TEAMS_ES;
  delete window.__ENUMS_ES;
  delete window.__COMPETITION_ES;
  delete window.__UI_ES;
})();