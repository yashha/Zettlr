/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        Print command
 * CVM-Role:        <none>
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This command shows the print window.
 *
 * END HEADER
 */

const ZettlrCommand = require('./zettlr-command')
const ZettlrPrint = require('../zettlr-print.js')
const { app } = require('electron')
const makeExport = require('../modules/export')

class Print extends ZettlrCommand {
  constructor (app) {
    super(app, 'print')

    // Load the print window handler class
    this._printWindow = new ZettlrPrint()
  }

  /**
   * Prints the current file (in: opening the print window)
   * @param {String} evt The event name
   * @param {Object} arg The argument
   * @return {Boolean} Whether the command ran successful
   */
  run (evt, arg) {
    // First we need to export the current file as HTML.
    let file = this._app.getCurrentFile()
    if (!file) return // No file open.
    let opt = {
      'format': 'html',
      'file': file, // The file to be exported
      'dest': app.getPath('temp'), // Export to temporary directory
      'stripIDs': global.config.get('export.stripIDs'),
      'stripTags': global.config.get('export.stripTags'),
      'stripLinks': global.config.get('export.stripLinks'),
      'title': file.name.substr(0, file.name.lastIndexOf('.')),
      'author': global.config.get('pdf').author,
      'autoOpen': false // Do not automatically open the file after export
    }

    // Call the exporter.
    makeExport(opt)
      .then((exporter) => {
        let file = exporter.getFile()
        // Now we'll need to open the print window.
        this._printWindow.openPrint(file)
      })
      .catch((err) => { global.ipc.notify(err.name + ': ' + err.message) }) // Error may be thrown
  }
}

module.exports = Print
