import fs from 'fs'

import data from './legacy-boxpresets.min.json'

fs.writeFileSync('./src/lib/data-client/box-presets/legacy-boxpresets.min.json', JSON.stringify(data))

// HOW to update? Unfortunately the dataset project preset format is not longer compatible with this legacy format.
// So you have to copy-paste the boxes array manually for the presets you want to update.
