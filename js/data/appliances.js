/**
 * Demo data for "Geräteauswahl nach Kriterien" in the appliance search panel.
 *
 * The live shop loads devices -> manufacturers -> models from its own API
 * (tom-select + XHR). That API is not part of the archive, so this file holds a
 * small sample catalogue with illustrative model numbers.
 */
window.ARTISAN_APPLIANCES = {
  categories: [
    'Kühlschrank', 'Geschirrspüler', 'Waschmaschine', 'Rasierer', 'E-Scooter', 'Herd',
    'Staubsauger', 'Kaffeemaschine', 'Ofen', 'Dunstabzugshaube', 'Gefrierschrank', 'Trockner',
    'Küchenmaschine', 'Kleingeräte', 'Saugroboter', 'Mikrowelle', 'Brotbackautomat',
    'Fleischwolf', 'Fritteuse', 'Side by Side Kühlschrank',
  ],

  // Which manufacturers are offered for a device type (fallback: `default`)
  manufacturers: {
    default: ['Bosch', 'Siemens', 'AEG', 'Electrolux', 'Beko', 'Samsung', 'Whirlpool', 'Bauknecht', 'Gorenje', 'Zanussi'],
    Rasierer: ['Braun', 'Philips', 'Panasonic'],
    'E-Scooter': ['Segway Ninebot', 'SoFlow', 'Xiaomi'],
    Kaffeemaschine: ['Delonghi', 'Krups', 'Saeco', 'Philips', 'Melitta', 'Siemens'],
    Staubsauger: ['Bosch', 'Siemens', 'Philips', 'Samsung', 'Hoover'],
    Saugroboter: ['Samsung', 'Philips', 'LG'],
  },

  // Model number prefixes per manufacturer, combined into sample numbers
  modelPrefixes: {
    Bosch: ['SMS', 'WAN', 'KGN', 'HBA'],
    Siemens: ['SN', 'WM', 'KG', 'HB'],
    AEG: ['FSE', 'L7F', 'RCB', 'BPE'],
    Electrolux: ['EEM', 'EW6', 'LNT', 'EOD'],
    Beko: ['DFN', 'WML', 'RCN', 'BIE'],
    Samsung: ['DW60', 'WW80', 'RB34', 'NV7B'],
    Whirlpool: ['WFC', 'FFB', 'W7X', 'AKZ'],
    Bauknecht: ['BCIC', 'WM', 'KGN', 'BIK'],
    Gorenje: ['GV6', 'WNEI', 'NRK', 'BO7'],
    Zanussi: ['ZDF', 'ZWF', 'ZNM', 'ZOB'],
    Braun: ['S9', '92', '70'],
    Philips: ['EP3', 'S7', 'FC9'],
    Panasonic: ['ES-LV', 'NN-', 'SD-'],
    'Segway Ninebot': ['MAX G', 'F2', 'E2'],
    SoFlow: ['SO4 PRO', 'SO1', 'SO6'],
    Xiaomi: ['Mi 3', 'Pro 2', '4 Lite'],
    Delonghi: ['ECAM', 'ETAM', 'EC'],
    Krups: ['EA81', 'XP52', 'EA89'],
    Saeco: ['SM76', 'HD89', 'RI93'],
    Melitta: ['F53', 'E957', 'F86'],
    Hoover: ['HP3', 'H-FREE', 'HF5'],
    LG: ['R9', 'VR6', 'M9'],
  },
};
