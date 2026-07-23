// i18n Engine for World Cup 2026
// Provides translation functions for all pages
var i18n = (function() {
  'use strict';

  var dict = window.__DICT || {};

  // Map of English team names to FIFA TLA codes.
  // (used when API doesn't provide tla field or for name-based lookups)
  var NAME_TO_TLA = {
    'Qatar': 'QAT',
    'Germany': 'GER',
    'Denmark': 'DEN',
    'Brazil': 'BRA',
    'France': 'FRA',
    'Belgium': 'BEL',
    'Croatia': 'CRO',
    'Spain': 'ESP',
    'Serbia': 'SRB',
    'England': 'ENG',
    'Switzerland': 'SUI',
    'Netherlands': 'NED',
    'Argentina': 'ARG',
    'Iran': 'IRN',
    'South Korea': 'KOR',
    'Japan': 'JPN',
    'Saudi Arabia': 'KSA',
    'Ecuador': 'ECU',
    'Uruguay': 'URU',
    'Canada': 'CAN',
    'Ghana': 'GHA',
    'Senegal': 'SEN',
    'Portugal': 'POR',
    'Poland': 'POL',
    'Tunisia': 'TUN',
    'Morocco': 'MAR',
    'Cameroon': 'CMR',
    'Mexico': 'MEX',
    'United States': 'USA',
    'Wales': 'WAL',
    'Australia': 'AUS',
    'Costa Rica': 'CRC',
    'Peru': 'PER',
    'Chile': 'CHI',
    'Colombia': 'COL',
    'Nigeria': 'NGA',
    'Egypt': 'EGY',
    'Ivory Coast': 'CIV',
    'Côte d\'Ivoire': 'CIV',
    'Mali': 'MLI',
    'Burkina Faso': 'BFA',
    'South Africa': 'RSA',
    'DR Congo': 'COD',
    'Algeria': 'ALG',
    'New Zealand': 'NZL',
    'Panama': 'PAN',
    'Jamaica': 'JAM',
    'Honduras': 'HON',
    'Slovakia': 'SVK',
    'Hungary': 'HUN',
    'Romania': 'ROU',
    'Ukraine': 'UKR',
    'Sweden': 'SWE',
    'Norway': 'NOR',
    'Scotland': 'SCO',
    'Ireland': 'IRL',
    'Republic of Ireland': 'IRL',
    'Iceland': 'ISL',
    'Turkey': 'TUR',
    'Türkiye': 'TUR',
    'Czech Republic': 'CZE',
    'Czechia': 'CZE',
    'Austria': 'AUT',
    'Russia': 'RUS',
    'Greece': 'GRE',
    'Israel': 'ISR',
    'Slovenia': 'SVN',
    'Bosnia and Herzegovina': 'BIH',
    'Montenegro': 'MNE',
    'North Macedonia': 'MKD',
    'Georgia': 'GEO',
    'Armenia': 'ARM',
    'Albania': 'ALB',
    'Kazakhstan': 'KAZ',
    'Azerbaijan': 'AZE',
    'Luxembourg': 'LUX',
    'Faroe Islands': 'FRO',
    'Malta': 'MLT',
    'Cyprus': 'CYP',
    'Andorra': 'AND',
    'Liechtenstein': 'LIE',
    'San Marino': 'SMR',
    'Gibraltar': 'GIB',
    'Belarus': 'BLR',
    'Estonia': 'EST',
    'Latvia': 'LAT',
    'Lithuania': 'LTU',
    'Moldova': 'MDA',
    'Kosovo': 'KOS',
    'Paraguay': 'PAR',
    'Bolivia': 'BOL',
    'Venezuela': 'VEN',
    'Guyana': 'GUY',
    'Suriname': 'SUR',
    'Trinidad and Tobago': 'TRI',
    'Saint Kitts and Nevis': 'SKN',
    'Dominica': 'DMA',
    'Saint Lucia': 'LCA',
    'Barbados': 'BRB',
    'Grenada': 'GRN',
    'Saint Vincent and the Grenadines': 'VCT',
    'Antigua and Barbuda': 'ATG',
    'Belize': 'BLZ',
    'Bahamas': 'BAH',
    'Bermuda': 'BER',
    'Cayman Islands': 'CAY',
    'Turks and Caicos Islands': 'TCA',
    'Montserrat': 'MSR',
    'British Virgin Islands': 'BVI',
    'Aruba': 'ARU',
    'Curaçao': 'CUW',
    'Nicaragua': 'NCA',
    'El Salvador': 'SLV',
    'Guatemala': 'GTM',
    'Dominican Republic': 'DOM',
    'Puerto Rico': 'PUR',
    'Cuba': 'CUB',
    'Haiti': 'HAI',
    'Bangladesh': 'BAN',
    'China': 'CHN',
    'China PR': 'CHN',
    'India': 'IND',
    'Indonesia': 'IDN',
    'Iraq': 'IRQ',
    'Jordan': 'JOR',
    'North Korea': 'PRK',
    'Korea DPR': 'PRK',
    'Korea Republic': 'KOR',
    'Kuwait': 'KUW',
    'Lebanon': 'LIB',
    'Malaysia': 'MAS',
    'Maldives': 'MDV',
    'Mongolia': 'MNG',
    'Myanmar': 'MYA',
    'Nepal': 'NEP',
    'Oman': 'OMA',
    'Pakistan': 'PAK',
    'Palestine': 'PLE',
    'Philippines': 'PHI',
    'Singapore': 'SGP',
    'Sri Lanka': 'SRI',
    'Syria': 'SYR',
    'Thailand': 'THA',
    'Turkmenistan': 'TKM',
    'United Arab Emirates': 'UAE',
    'Uzbekistan': 'UZB',
    'Vietnam': 'VIE',
    'Yemen': 'YEM',
    'Angola': 'ANG',
    'Benin': 'BEN',
    'Botswana': 'BOT',
    'Burundi': 'BDI',
    'Cape Verde': 'CPV',
    'Cabo Verde': 'CPV',
    'Central African Republic': 'CTA',
    'Chad': 'CHA',
    'Comoros': 'COM',
    'Congo': 'CGO',
    'Djibouti': 'DJI',
    'Equatorial Guinea': 'EQG',
    'Eritrea': 'ERI',
    'Ethiopia': 'ETH',
    'Gabon': 'GAB',
    'Gambia': 'GAM',
    'Guinea': 'GUI',
    'Guinea-Bissau': 'GNB',
    'Kenya': 'KEN',
    'Lesotho': 'LES',
    'Liberia': 'LBR',
    'Libya': 'LBY',
    'Madagascar': 'MAD',
    'Malawi': 'MWI',
    'Mauritania': 'MTN',
    'Mauritius': 'MRI',
    'Mozambique': 'MOZ',
    'Namibia': 'NAM',
    'Niger': 'NIG',
    'Rwanda': 'RWA',
    'São Tomé and Príncipe': 'STP',
    'Seychelles': 'SEY',
    'Sierra Leone': 'SLE',
    'Somalia': 'SOM',
    'South Sudan': 'SSD',
    'Sudan': 'SUD',
    'Eswatini': 'SWZ',
    'Tanzania': 'TAN',
    'Togo': 'TOG',
    'Uganda': 'UGA',
    'Zambia': 'ZAM',
    'Zimbabwe': 'ZIM',
    'Fiji': 'FIJ',
    'Solomon Islands': 'SOL',
    'Vanuatu': 'VAN',
    'Samoa': 'SAM',
    'American Samoa': 'ASA',
    'Tahiti': 'TAH',
    'Papua New Guinea': 'PNG',
    'New Caledonia': 'NCL',
    'Chinese Taipei': 'TPE',
    'Macau': 'MAC',
    'Brunei': 'BRU',
    'Cambodia': 'CAM',
    'Laos': 'LAO',
    'Timor-Leste': 'TLS',
    'Afghanistan': 'AFG',
    'Bahrain': 'BHR',
    'Bhutan': 'BHU',
    'Kyrgyzstan': 'KGZ',
    'Tajikistan': 'TJK',
    'Northern Ireland': 'NIR',
    'USA': 'USA',
    'Ivory Coast': 'CIV',
    'Cape Verde Islands': 'CPV'
  };

  // Generic translation by key
  function t(key) {
    return dict[key] || key;
  }

  // Get TLA (3-letter code) from a team object or name string
  function getTLA(team) {
    if (!team) return null;
    // If it's an object with tla field, use it
    if (team.tla) return team.tla;
    // If it's a string, check if it's already a TLA (3 uppercase letters)
    if (typeof team === 'string') {
      if (team.length === 3 && team === team.toUpperCase()) {
        return team; // Already a TLA
      }
      // Try lookup by full name
      return NAME_TO_TLA[team] || null;
    }
    // Try by name field
    if (team.name) {
      return NAME_TO_TLA[team.name] || null;
    }
    return null;
  }

  // Get short display code (3 chars) for a team
  function getShortCode(team) {
    var tla = getTLA(team);
    if (tla) return tla;
    // Fallback: first 3 chars of name
    var name = (typeof team === 'string') ? team : (team && team.name);
    if (!name) return '???';
    var words = name.split(' ');
    if (words.length === 1) return name.substring(0, 3).toUpperCase();
    return words.map(function(w) { return w[0]; }).join('').substring(0, 3).toUpperCase();
  }

  // Translate team name from team object or TLA
  function translateTeam(team) {
    var tla = getTLA(team);
    if (tla && dict[tla]) {
      return dict[tla];
    }
    // Fallback to English name or TLA
    if (typeof team === 'string') return tla || team;
    if (team && team.name) return team.name;
    return tla || '';
  }

  // Translate match status (long form)
  function translateStatus(status) {
    if (!status) return '';
    var key = status.toUpperCase();
    return dict[key] || key;
  }

  // Translate match status (short form)
  function translateStatusShort(status) {
    if (!status) return '';
    var key = status.toUpperCase() + '_SHORT';
    return dict[key] || status;
  }

  // Translate stage name
  function translateStage(stage) {
    if (!stage) return '';
    // Try exact uppercase match
    var key = 'STAGE_' + stage.toUpperCase().replace(/-/g, '_');
    var result = dict[key];
    if (result) return result;
    
    // Try with the stage as-is (some APIs return different formats)
    key = 'STAGE_' + stage.toUpperCase();
    result = dict[key];
    if (result) return result;
    
    // Fallback: clean up the stage string
    return stage.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
  }

  // Translate group name (handles "GROUP_A", "GROUP_1", "A", "1", "Group A" etc.)
  function translateGroup(group, usePrefix) {
    if (!group) return '';
    usePrefix = (usePrefix !== false); // default true
    
    // Extract the group letter/number
    var letter = group;
    if (group.toUpperCase().indexOf('GROUP_') === 0) {
      letter = group.substring(6); // "GROUP_A" → "A"
    } else if (group.toUpperCase().indexOf('GROUP ') === 0) {
      letter = group.substring(6); // "Group A" → "A"
    }
    
    if (usePrefix) {
      var prefix = dict['GROUP_PREFIX'] || 'Group ';
      return prefix + letter;
    }
    return letter;
  }

  // Translate nationality (for scorers table)
  function translateNationality(nationality) {
    if (!nationality) return '';
    // Try team TLA lookup (nationality already is a TLA)
    if (dict[nationality]) {
      return dict[nationality];
    }
    // The API usually returns the nationality as a full English name
    // (e.g. "France"). Resolve it to a TLA and translate from there.
    var tla = NAME_TO_TLA[nationality];
    if (tla && dict[tla]) {
      return dict[tla];
    }
    // Try Intl.DisplayNames as fallback (covers ISO countries not in our list)
    try {
      var displayNames = new Intl.DisplayNames(['es'], { type: 'region' });
      var result = displayNames.of(nationality);
      if (result && result !== nationality) return result;
    } catch(e) {
      // Intl not available, fall through
    }
    return nationality;
  }

  // Format a date string to Spanish locale
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      var date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch(e) {
      return dateStr;
    }
  }

  // Format a time string from ISO date
  function formatTime(dateStr) {
    if (!dateStr) return '';
    try {
      var date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch(e) {
      return dateStr;
    }
  }

  // Get relative day label (Hoy, Mañana, Ayer) or formatted date
  function getRelativeDay(dateStr) {
    if (!dateStr) return '';
    try {
      var matchDate = new Date(dateStr);
      if (isNaN(matchDate.getTime())) return dateStr;
      
      var today = new Date();
      // Reset time parts for date comparison
      var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
      
      var diffDays = Math.round((matchDay - todayStart) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return t('TODAY');
      if (diffDays === 1) return t('TOMORROW');
      if (diffDays === -1) return t('YESTERDAY');
      
      return matchDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    } catch(e) {
      return dateStr;
    }
  }

  // Get match minute string (e.g., "45'", "En Vivo")
  function getMinuteText(match) {
    if (!match) return '';
    if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
      if (match.minute) return match.minute + "'";
      return t('LIVE');
    }
    return '';
  }

  return {
    t: t,
    getTLA: getTLA,
    getShortCode: getShortCode,
    translateTeam: translateTeam,
    translateStatus: translateStatus,
    translateStatusShort: translateStatusShort,
    translateStage: translateStage,
    translateGroup: translateGroup,
    translateNationality: translateNationality,
    formatDate: formatDate,
    formatTime: formatTime,
    getRelativeDay: getRelativeDay,
    getMinuteText: getMinuteText
  };
})();